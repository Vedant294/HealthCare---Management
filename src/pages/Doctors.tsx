import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable, { Column } from '@/components/shared/DataTable';
import ModalForm from '@/components/shared/ModalForm';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { useApp, Doctor } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const Doctors = () => {
  const { doctors, setDoctors, addAuditLog, hospitalId } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Doctor | null>(null);
  const [form, setForm] = useState({ name: '', department: '', availability: '', status: 'Available' as Doctor['status'], slotDuration: 30 });

  const openAdd = () => { setEditing(null); setForm({ name: '', department: '', availability: '', status: 'Available', slotDuration: 30 }); setModalOpen(true); };
  const openEdit = (d: Doctor) => { setEditing(d); setForm({ ...d }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.name || !form.department) { toast.error('Fill required fields'); return; }
    if (editing) {
      const { error } = await supabase.from('doctors').update({
        name: form.name, department: form.department, availability: form.availability,
        status: form.status, slot_duration: form.slotDuration,
      }).eq('id', editing.id);
      if (error) { toast.error('Failed to update doctor'); return; }
      setDoctors(prev => prev.map(d => d.id === editing.id ? { ...d, ...form } : d));
      addAuditLog('Updated Doctor', 'Doctors');
      toast.success('Doctor updated');
    } else {
      const { data, error } = await supabase.from('doctors').insert({
        hospital_id: hospitalId, name: form.name, department: form.department,
        availability: form.availability, status: form.status, slot_duration: form.slotDuration,
      }).select().single();
      if (error) { toast.error('Failed to add doctor'); return; }
      setDoctors(prev => [...prev, { ...form, id: data.id }]);
      addAuditLog('Created Doctor', 'Doctors');
      toast.success('Doctor added');
    }
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this doctor?')) return;
    const { error } = await supabase.from('doctors').delete().eq('id', id);
    if (error) { toast.error('Failed to delete doctor'); return; }
    setDoctors(prev => prev.filter(d => d.id !== id));
    addAuditLog('Deleted Doctor', 'Doctors');
    toast.success('Doctor deleted');
  };

  const columns: Column<Doctor>[] = [
    { key: 'name', label: 'Doctor Name' },
    { key: 'department', label: 'Department' },
    { key: 'availability', label: 'Availability' },
    { key: 'slotDuration', label: 'Slot (min)', render: (d) => <span>{d.slotDuration} min</span> },
    { key: 'status', label: 'Status', render: (d) => <StatusBadge status={d.status} /> },
    {
      key: 'actions', label: 'Actions', render: (d) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEdit(d); }}><Pencil className="w-4 h-4" /></Button>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(d.id); }}><Trash2 className="w-4 h-4 text-destructive" /></Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader title="Doctors" subtitle="Manage doctor profiles & schedules" actionLabel="Add Doctor" onAction={openAdd} />
      <DataTable columns={columns} data={doctors} />

      <ModalForm open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Doctor' : 'Add Doctor'} onSubmit={handleSave}>
        <div className="space-y-3">
          <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div><Label>Department</Label><Input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} /></div>
          <div><Label>Availability</Label><Input value={form.availability} onChange={e => setForm(f => ({ ...f, availability: e.target.value }))} placeholder="e.g. Mon-Fri 9AM-5PM" /></div>
          <div><Label>Slot Duration (min)</Label><Input type="number" value={form.slotDuration} onChange={e => setForm(f => ({ ...f, slotDuration: parseInt(e.target.value) || 30 }))} /></div>
          <div><Label>Status</Label>
            <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as Doctor['status'] }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="Available">Available</SelectItem><SelectItem value="On Leave">On Leave</SelectItem><SelectItem value="In Surgery">In Surgery</SelectItem></SelectContent>
            </Select>
          </div>
        </div>
      </ModalForm>
    </DashboardLayout>
  );
};

export default Doctors;
