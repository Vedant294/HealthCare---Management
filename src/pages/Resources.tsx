import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable, { Column } from '@/components/shared/DataTable';
import ModalForm from '@/components/shared/ModalForm';
import PageHeader from '@/components/shared/PageHeader';
import { useApp, Resource } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { exportResourcesToPDF, exportNetworkResourcesToPDF } from '@/lib/pdfExport';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Network, Building2, FileDown } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface NetworkResource {
  id: string;
  name: string;
  type: string;
  total: number;
  occupied: number;
  available: number;
  hospital: string;
  city: string;
  hospital_id: string;
  threshold?: number;
}

const Resources = () => {
  const { resources, setResources, addAuditLog, hospitalId } = useApp();
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Resource | null>(null);
  const [activeTab, setActiveTab] = useState('bed');
  const [viewMode, setViewMode] = useState<'my-hospital' | 'network'>('my-hospital');
  const [form, setForm] = useState<{
    name: string; type: string; total: string; occupied: string; available: number; threshold: string;
  }>({ name: '', type: 'bed', total: '', occupied: '', available: 0, threshold: '' });
  const [networkResources, setNetworkResources] = useState<NetworkResource[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (viewMode === 'network') fetchNetworkResources();
  }, [viewMode]);

  const fetchNetworkResources = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('resources')
      .select('*, hospitals(name, city)')
      .order('type');
    if (data) {
      setNetworkResources(data.map((r: any) => ({
        id: r.id, name: r.name, type: r.type, total: r.total,
        occupied: r.occupied, available: r.available,
        hospital: r.hospitals?.name || 'Unknown',
        city: r.hospitals?.city || '',
        hospital_id: r.hospital_id, threshold: r.threshold,
      })));
    }
    setLoading(false);
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', type: activeTab, total: '', occupied: '', available: 0, threshold: '' });
    setModalOpen(true);
  };
  
  const openEdit = (r: Resource) => { 
    setEditing(r); 
    setForm({ 
      name: r.name,
      type: r.type,
      total: r.total.toString(), 
      occupied: r.occupied.toString(), 
      available: r.available || 0, 
      threshold: (r.threshold || 0).toString() 
    }); 
    setModalOpen(true); 
  };

  const handleSave = async () => {
    if (!form.name.trim()) { 
      toast.error('Name is required'); 
      return; 
    }

    const total = typeof form.total === 'string' ? parseInt(form.total) || 0 : form.total;
    const occupied = typeof form.occupied === 'string' ? parseInt(form.occupied) || 0 : form.occupied;
    const threshold = typeof form.threshold === 'string' ? parseInt(form.threshold) || 0 : form.threshold;

    if (total < 0 || occupied < 0 || threshold < 0) {
      toast.error('Values cannot be negative');
      return;
    }

    if (occupied > total) {
      toast.error('Occupied cannot exceed total');
      return;
    }

    try {
      if (editing) {
        const { error } = await supabase.from('resources').update({
          name: form.name, total, occupied, threshold,
        }).eq('id', editing.id);
        if (error) throw error;
        setResources(resources.map(r =>
          r.id === editing.id ? { ...r, name: form.name, total, occupied, available: total - occupied, threshold } : r
        ));
        addAuditLog('Updated Resource', 'Resources');
        toast.success('Resource updated');
      } else {
        const { data, error } = await supabase.from('resources').insert({
          hospital_id: hospitalId, name: form.name, type: form.type, total, occupied, threshold,
        }).select().single();
        if (error) throw error;
        const newResource: Resource = {
          id: data.id, name: form.name, type: form.type,
          total, occupied, available: total - occupied, threshold, hospital_id: hospitalId || '',
        };
        setResources([...resources, newResource]);
        addAuditLog('Created Resource', 'Resources');
        toast.success('Resource added');
      }
      setModalOpen(false);
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || 'Failed to save resource');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this resource?')) return;
    try {
      const { error } = await supabase.from('resources').delete().eq('id', id);
      if (error) throw error;
      setResources(resources.filter(r => r.id !== id));
      addAuditLog('Deleted Resource', 'Resources');
      toast.success('Resource deleted');
    } catch (error) {
      toast.error('Failed to delete resource');
    }
  };

  const makeColumns = (): Column<Resource>[] => [
    { key: 'name', label: 'Name' },
    { key: 'total', label: 'Total' },
    { key: 'occupied', label: 'In Use' },
    { key: 'available', label: 'Available' },
    {
      key: 'usage', label: 'Usage', render: (r) => {
        const pct = Math.round((r.occupied / r.total) * 100);
        return (
          <div className="flex items-center gap-2 min-w-[120px]">
            <Progress value={pct} className="h-2 flex-1" />
            <span className="text-xs text-muted-foreground w-10">{pct}%</span>
          </div>
        );
      }
    },
    {
      key: 'actions', label: 'Actions', render: (r) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => openEdit(r)}><Pencil className="w-4 h-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
        </div>
      ),
    },
  ];

  const makeNetworkColumns = (): Column<NetworkResource>[] => [
    { 
      key: 'hospital', 
      label: 'Hospital', 
      render: (r: NetworkResource) => (
        <div>
          <p className="font-medium text-sm">{r.hospital}</p>
          <p className="text-xs text-muted-foreground">{r.city}</p>
        </div>
      )
    },
    { key: 'name', label: 'Resource' },
    { key: 'total', label: 'Total' },
    { key: 'occupied', label: 'In Use' },
    { 
      key: 'available', 
      label: 'Available',
      render: (r: NetworkResource) => (
        <Badge variant={r.available > 10 ? 'default' : r.available > 5 ? 'secondary' : 'destructive'}>
          {r.available}
        </Badge>
      )
    },
    {
      key: 'usage', label: 'Usage', render: (r: NetworkResource) => {
        const pct = Math.round((r.occupied / r.total) * 100);
        return (
          <div className="flex items-center gap-2 min-w-[120px]">
            <Progress value={pct} className="h-2 flex-1" />
            <span className="text-xs text-muted-foreground w-10">{pct}%</span>
          </div>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r: NetworkResource) => {
        // Don't show request button for own hospital (City General Hospital is "our" hospital in mock data)
        const isOwnHospital = r.hospital === 'City General Hospital';
        
        return !isOwnHospital ? (
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => {
              toast.success(`Request sent to ${r.hospital} for ${r.name}`);
              addAuditLog(`Requested ${r.name} from ${r.hospital}`, 'Resources');
            }}
          >
            Request
          </Button>
        ) : (
          <Badge variant="secondary">Your Hospital</Badge>
        );
      }
    }
  ];

  const tabs = [
    { value: 'bed', label: 'Beds' },
    { value: 'oxygen', label: 'Oxygen' },
    { value: 'blood', label: 'Blood Bank' },
    { value: 'ventilator', label: 'Ventilators' },
  ];

  const handleExportPDF = async () => {
    try {
      console.log('Export PDF clicked');
      console.log('Resources:', resources);
      console.log('User:', user);

      if (resources.length === 0) {
        toast.error('No resources to export');
        return;
      }

      const hospitalName = user?.hospital || 'Hospital';
      const userName = user?.name || 'Admin';

      console.log('Calling exportResourcesToPDF with:', { hospitalName, userName, resourceCount: resources.length });

      toast.info('Generating PDF...');

      // Small delay to show the toast
      await new Promise(resolve => setTimeout(resolve, 100));

      const filename = exportResourcesToPDF({
        hospitalName,
        resources,
        userName
      });

      console.log('PDF generated:', filename);
      toast.success(`PDF downloaded: ${filename}`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error(`Failed to export PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleExportNetworkPDF = async () => {
    try {
      if (networkResources.length === 0) {
        toast.error('No network resources to export');
        return;
      }

      const userName = user?.name || 'Admin';

      toast.info('Generating network PDF...');

      await new Promise(resolve => setTimeout(resolve, 100));

      const filename = exportNetworkResourcesToPDF({
        resources: networkResources,
        userName
      });

      toast.success(`PDF downloaded: ${filename}`);
    } catch (error) {
      console.error('Error exporting network PDF:', error);
      toast.error(`Failed to export PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader 
        title="Resources" 
        subtitle="Manage hospital resources" 
        actionLabel={viewMode === 'my-hospital' ? 'Add Resource' : undefined}
        onAction={viewMode === 'my-hospital' ? openAdd : undefined}
      />

      {/* Action Buttons */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'my-hospital' ? 'default' : 'outline'}
            onClick={() => setViewMode('my-hospital')}
            className="gap-2"
          >
            <Building2 className="w-4 h-4" />
            My Hospital
          </Button>
          <Button
            variant={viewMode === 'network' ? 'default' : 'outline'}
            onClick={() => setViewMode('network')}
            className="gap-2"
          >
            <Network className="w-4 h-4" />
            Network View
          </Button>
        </div>

        {/* Export PDF Buttons */}
        <div className="flex gap-2">
          {viewMode === 'my-hospital' && resources.length > 0 && (
            <Button
              variant="outline"
              onClick={handleExportPDF}
              className="gap-2"
            >
              <FileDown className="w-4 h-4" />
              Export My Resources
            </Button>
          )}
          
          {viewMode === 'network' && networkResources.length > 0 && (
            <Button
              variant="outline"
              onClick={handleExportNetworkPDF}
              className="gap-2"
            >
              <FileDown className="w-4 h-4" />
              Export Network Report
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading resources...</p>
          </div>
        </div>
      ) : viewMode === 'my-hospital' ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            {tabs.map(t => <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>)}
          </TabsList>
          {tabs.map(t => (
            <TabsContent key={t.value} value={t.value}>
              <DataTable columns={makeColumns()} data={resources.filter(r => r.type === t.value)} />
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            {tabs.map(t => <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>)}
          </TabsList>
          {tabs.map(t => (
            <TabsContent key={t.value} value={t.value}>
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Network View:</strong> Showing resources from other hospitals in the network. Click "Request" to send a resource request.
                </p>
              </div>
              <DataTable 
                columns={makeNetworkColumns()} 
                data={networkResources.filter(r => r.type === t.value)} 
              />
            </TabsContent>
          ))}
        </Tabs>
      )}

      <ModalForm open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Resource' : 'Add Resource'} onSubmit={handleSave}>
        <div className="space-y-3">
          <div>
            <Label>Name</Label>
            <Input 
              value={form.name} 
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
              placeholder="e.g., ICU Bed, Oxygen Cylinder"
            />
          </div>
          <div>
            <Label>Total</Label>
            <Input 
              type="number" 
              value={form.total} 
              onChange={e => setForm(f => ({ ...f, total: e.target.value }))} 
              placeholder="Total capacity"
              min="0"
            />
          </div>
          <div>
            <Label>In Use</Label>
            <Input 
              type="number" 
              value={form.occupied} 
              onChange={e => setForm(f => ({ ...f, occupied: e.target.value }))} 
              placeholder="Currently occupied"
              min="0"
            />
          </div>
          <div>
            <Label>Threshold (Alert Level)</Label>
            <Input 
              type="number" 
              value={form.threshold} 
              onChange={e => setForm(f => ({ ...f, threshold: e.target.value }))} 
              placeholder="Alert when available < threshold"
              min="0"
            />
          </div>
        </div>
      </ModalForm>
    </DashboardLayout>
  );
};

export default Resources;
