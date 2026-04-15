import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable, { Column } from '@/components/shared/DataTable';
import ModalForm from '@/components/shared/ModalForm';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { useApp, ServiceRequest } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const ServiceRequests = () => {
  const { serviceRequests, setServiceRequests, addAuditLog, hospitalId } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ hospitalName: '', resourceType: '', quantity: 1, urgency: 'Medium' as ServiceRequest['urgency'], message: '' });

  // List of hospitals
  const hospitals = [
    'City General Hospital',
    'Metro Care Hospital',
    'St. Mary\'s Medical Center',
    'Apollo Healthcare',
    'Fortis Hospital',
    'Max Super Specialty Hospital',
    'AIIMS Delhi',
    'Lilavati Hospital',
  ];

  const openAdd = () => { setForm({ hospitalName: '', resourceType: '', quantity: 1, urgency: 'Medium', message: '' }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.hospitalName) { toast.error('Enter hospital name'); return; }
    if (!form.resourceType) { toast.error('Select resource type'); return; }
    const { data, error } = await supabase.from('service_requests').insert({
      hospital_id: hospitalId,
      hospital_name: form.hospitalName,
      resource_type: form.resourceType,
      quantity: form.quantity,
      urgency: form.urgency,
      message: form.message,
      status: 'Pending',
      request_date: new Date().toISOString().split('T')[0],
    }).select().single();
    if (error) { toast.error('Failed to submit request'); return; }
    const req: ServiceRequest = {
      id: data.id, hospitalName: data.hospital_name, resourceType: data.resource_type,
      quantity: data.quantity, urgency: data.urgency, message: data.message,
      status: data.status, date: data.request_date,
    };
    setServiceRequests(prev => [req, ...prev]);
    addAuditLog('Created Service Request', 'Service Requests');
    toast.success('Service request submitted');
    setModalOpen(false);
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this request?')) return;
    await supabase.from('service_requests').delete().eq('id', id);
    setServiceRequests(prev => prev.filter(r => r.id !== id));
    addAuditLog('Cancelled Service Request', 'Service Requests');
    toast.success('Request cancelled');
  };

  const columns: Column<ServiceRequest>[] = [
    { key: 'id', label: 'Request ID' },
    { key: 'hospitalName', label: 'Hospital' },
    { key: 'resourceType', label: 'Resource' },
    { key: 'quantity', label: 'Qty' },
    { key: 'urgency', label: 'Urgency', render: (r) => <StatusBadge status={r.urgency} /> },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'date', label: 'Date' },
    {
      key: 'actions', label: 'Actions', render: (r) => r.status === 'Pending' ? (
        <Button variant="ghost" size="sm" onClick={() => handleCancel(r.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
      ) : null,
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader title="Service Requests" subtitle="Request resources and supplies" actionLabel="New Request" onAction={openAdd} />
      <DataTable columns={columns} data={serviceRequests} />

      <ModalForm open={modalOpen} onClose={() => setModalOpen(false)} title="New Service Request" onSubmit={handleSave}>
        <div className="space-y-3">
          <div>
            <Label>Hospital Name</Label>
            <Select value={form.hospitalName} onValueChange={v => setForm(f => ({ ...f, hospitalName: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select hospital" />
              </SelectTrigger>
              <SelectContent>
                {hospitals.map((hospital) => (
                  <SelectItem key={hospital} value={hospital}>
                    {hospital}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Resource Type</Label>
            <Select value={form.resourceType} onValueChange={v => setForm(f => ({ ...f, resourceType: v }))}>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Oxygen Cylinders">Oxygen Cylinders</SelectItem>
                <SelectItem value="Blood Units">Blood Units</SelectItem>
                <SelectItem value="Ventilators">Ventilators</SelectItem>
                <SelectItem value="Beds">Beds</SelectItem>
                <SelectItem value="Medical Supplies">Medical Supplies</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Quantity</Label><Input type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: parseInt(e.target.value) || 1 }))} /></div>
          <div><Label>Urgency</Label>
            <Select value={form.urgency} onValueChange={v => setForm(f => ({ ...f, urgency: v as ServiceRequest['urgency'] }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem><SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem><SelectItem value="Critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Message</Label><Textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Additional details..." /></div>
        </div>
      </ModalForm>
    </DashboardLayout>
  );
};

export default ServiceRequests;
