import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable, { Column } from '@/components/shared/DataTable';
import ModalForm from '@/components/shared/ModalForm';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { useApp, Patient } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const Patients = () => {
  const { patients, setPatients, addAuditLog, hospitalId } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [form, setForm] = useState({ name: '', age: 0, contact: '', lastVisit: '', status: 'Active' as Patient['status'], gender: 'Male', bloodGroup: 'O+' });

  const openAdd = () => { setEditing(null); setForm({ name: '', age: 0, contact: '', lastVisit: '', status: 'Active', gender: 'Male', bloodGroup: 'O+' }); setModalOpen(true); };
  const openEdit = (p: Patient) => { setEditing(p); setForm({ ...p }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.name) { toast.error('Name is required'); return; }
    if (editing) {
      const { error } = await supabase.from('patients').update({
        name: form.name, age: form.age, contact: form.contact,
        last_visit: form.lastVisit, status: form.status, gender: form.gender, blood_group: form.bloodGroup,
      }).eq('id', editing.id);
      if (error) { toast.error('Failed to update patient'); return; }
      setPatients(prev => prev.map(p => p.id === editing.id ? { ...p, ...form } : p));
      addAuditLog('Updated Patient', 'Patients');
      toast.success('Patient updated');
    } else {
      const { data, error } = await supabase.from('patients').insert({
        hospital_id: hospitalId, name: form.name, age: form.age, contact: form.contact,
        last_visit: form.lastVisit || null, status: form.status, gender: form.gender, blood_group: form.bloodGroup,
      }).select().single();
      if (error) { toast.error('Failed to add patient'); return; }
      setPatients(prev => [...prev, { ...form, id: data.id }]);
      addAuditLog('Created Patient', 'Patients');
      toast.success('Patient added');
    }
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this patient?')) return;
    const { error } = await supabase.from('patients').delete().eq('id', id);
    if (error) { toast.error('Failed to delete patient'); return; }
    setPatients(prev => prev.filter(p => p.id !== id));
    addAuditLog('Deleted Patient', 'Patients');
    toast.success('Patient deleted');
  };

  const columns: Column<Patient>[] = [
    { key: 'name', label: 'Name' },
    { key: 'age', label: 'Age' },
    { key: 'gender', label: 'Gender' },
    { key: 'contact', label: 'Contact' },
    { key: 'bloodGroup', label: 'Blood Group' },
    { key: 'lastVisit', label: 'Last Visit' },
    { key: 'status', label: 'Status', render: (p) => <StatusBadge status={p.status} /> },
    {
      key: 'actions', label: 'Actions', render: (p) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEdit(p); }}><Pencil className="w-4 h-4" /></Button>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}><Trash2 className="w-4 h-4 text-destructive" /></Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader title="Patients" subtitle="Manage patient records" actionLabel="Add Patient" onAction={openAdd} />
      <DataTable columns={columns} data={patients} />

      <ModalForm open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Patient' : 'Add Patient'} onSubmit={handleSave}>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div><Label>Age</Label><Input type="number" value={form.age} onChange={e => setForm(f => ({ ...f, age: parseInt(e.target.value) || 0 }))} /></div>
          <div><Label>Gender</Label>
            <Select value={form.gender} onValueChange={v => setForm(f => ({ ...f, gender: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
            </Select>
          </div>
          <div><Label>Contact</Label><Input value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} /></div>
          <div><Label>Blood Group</Label><Input value={form.bloodGroup} onChange={e => setForm(f => ({ ...f, bloodGroup: e.target.value }))} /></div>
          <div><Label>Status</Label>
            <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as Patient['status'] }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Critical">Critical</SelectItem><SelectItem value="Discharged">Discharged</SelectItem></SelectContent>
            </Select>
          </div>
        </div>
      </ModalForm>
    </DashboardLayout>
  );
};

export default Patients;
