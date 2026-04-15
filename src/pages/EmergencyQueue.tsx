import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable, { Column } from '@/components/shared/DataTable';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { useApp, EmergencyCase } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const EmergencyQueue = () => {
  const { emergencyCases, setEmergencyCases, addAuditLog } = useApp();

  const updateStatus = async (id: string, status: EmergencyCase['status']) => {
    setEmergencyCases(prev => prev.map(e => e.id === id ? { ...e, status } : e));
    await supabase.from('emergency_cases').update({ status }).eq('id', id);
    addAuditLog(`Emergency ${status}`, 'Emergency Queue');
    toast.success(`Status updated to ${status}`);
  };

  const updateSeverity = async (id: string, severity: EmergencyCase['severity']) => {
    setEmergencyCases(prev => prev.map(e => e.id === id ? { ...e, severity } : e));
    await supabase.from('emergency_cases').update({ severity }).eq('id', id);
    addAuditLog('Changed Emergency Priority', 'Emergency Queue');
    toast.success('Priority updated');
  };

  const columns: Column<EmergencyCase>[] = [
    { key: 'patientName', label: 'Patient' },
    {
      key: 'severity', label: 'Severity', render: (e) => (
        <Select value={e.severity} onValueChange={v => updateSeverity(e.id, v as EmergencyCase['severity'])}>
          <SelectTrigger className="w-28 h-8"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Low">Low</SelectItem><SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="High">High</SelectItem><SelectItem value="Critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    { key: 'arrivalTime', label: 'Arrival Time' },
    { key: 'assignedResource', label: 'Assigned Resource' },
    { key: 'status', label: 'Status', render: (e) => <StatusBadge status={e.status} /> },
    {
      key: 'actions', label: 'Actions', render: (e) => (
        <div className="flex gap-1">
          {e.status !== 'Resolved' && (
            <Button size="sm" variant="outline" onClick={() => updateStatus(e.id, 'Resolved')}>Resolve</Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader title="Emergency Queue" subtitle="Monitor and manage emergency cases" />
      <DataTable columns={columns} data={emergencyCases} />
    </DashboardLayout>
  );
};

export default EmergencyQueue;
