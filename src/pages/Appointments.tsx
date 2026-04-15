import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable, { Column } from '@/components/shared/DataTable';
import ModalForm from '@/components/shared/ModalForm';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Phone } from 'lucide-react';
import { toast } from 'sonner';

interface SupabaseAppointment {
  id: string;
  phone_number: string;
  patient_name: string | null;
  appointment_date: string;
  appointment_time: string;
  doctor: string | null;
  department: string | null;
  status: string;
  source: string;
  created_at: string;
}

interface AppointmentDisplay {
  id: string;
  patientName: string;
  phoneNumber: string;
  date: string;
  time: string;
  doctor: string;
  department: string;
  status: 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  source: 'whatsapp' | 'manual';
}

const Appointments = () => {
  const { addAuditLog, doctors } = useApp();
  const [appointments, setAppointments] = useState<AppointmentDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AppointmentDisplay | null>(null);
  const [form, setForm] = useState({ 
    patientName: '', 
    phoneNumber: '', 
    date: '', 
    time: '',
    doctor: '', 
    department: '', 
    status: 'confirmed' as AppointmentDisplay['status']
  });

  // Fetch appointments from Supabase
  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: false });

      if (error) {
        console.error('Error fetching appointments:', error);
        toast.error('Failed to load appointments');
        return;
      }

      if (data) {
        const formatted: AppointmentDisplay[] = data.map((apt: SupabaseAppointment) => ({
          id: apt.id.toString(),
          patientName: apt.patient_name || 'Unknown',
          phoneNumber: apt.phone_number,
          date: apt.appointment_date,
          time: apt.appointment_time,
          doctor: apt.doctor || 'Dr. Assigned',
          department: apt.department || 'General',
          status: apt.status as AppointmentDisplay['status'],
          source: apt.source as AppointmentDisplay['source'] || 'manual',
        }));
        setAppointments(formatted);
        toast.success(`Loaded ${formatted.length} appointments`);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => { 
    setEditing(null); 
    setForm({ 
      patientName: '', 
      phoneNumber: '', 
      date: '', 
      time: '',
      doctor: '', 
      department: '', 
      status: 'confirmed' 
    }); 
    setModalOpen(true); 
  };
  
  const openEdit = (a: AppointmentDisplay) => { 
    setEditing(a); 
    setForm({ 
      patientName: a.patientName,
      phoneNumber: a.phoneNumber,
      date: a.date,
      time: a.time,
      doctor: a.doctor,
      department: a.department,
      status: a.status
    }); 
    setModalOpen(true); 
  };

  const handleSave = async () => {
    if (!form.patientName || !form.phoneNumber || !form.date || !form.time) { 
      toast.error('Please fill all required fields'); 
      return; 
    }

    // Validate phone number format
    if (!/^\+?[1-9]\d{1,14}$/.test(form.phoneNumber.replace(/\s/g, ''))) {
      toast.error('Please enter a valid phone number');
      return;
    }

    try {
      if (editing) {
        // Update existing appointment
        const { error } = await supabase
          .from('appointments')
          .update({
            patient_name: form.patientName,
            phone_number: form.phoneNumber,
            appointment_date: form.date,
            appointment_time: form.time,
            status: form.status,
          })
          .eq('id', editing.id);

        if (error) throw error;

        addAuditLog('Updated Appointment', 'Appointments');
        toast.success('Appointment updated');
        
        // TODO: Send WhatsApp notification
        sendWhatsAppNotification(form.phoneNumber, form.patientName, form.date, form.time, 'updated');
      } else {
        // Create new appointment
        const { error } = await supabase
          .from('appointments')
          .insert({
            patient_name: form.patientName,
            phone_number: form.phoneNumber,
            appointment_date: form.date,
            appointment_time: form.time,
            status: form.status,
          });

        if (error) throw error;

        addAuditLog('Created Appointment', 'Appointments');
        toast.success('Appointment created');
        
        // TODO: Send WhatsApp notification
        sendWhatsAppNotification(form.phoneNumber, form.patientName, form.date, form.time, 'created');
      }

      setModalOpen(false);
      fetchAppointments(); // Refresh the list
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error saving appointment:', err);
      toast.error('Failed to save appointment: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this appointment?')) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      addAuditLog('Deleted Appointment', 'Appointments');
      toast.success('Appointment deleted');
      fetchAppointments(); // Refresh the list
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error('Failed to delete appointment');
    }
  };

  // WhatsApp notification function (placeholder - add your API integration)
  const sendWhatsAppNotification = async (
    phoneNumber: string, 
    patientName: string, 
    date: string, 
    time: string,
    action: 'created' | 'updated'
  ) => {
    console.log('Sending WhatsApp notification:', { phoneNumber, patientName, date, time, action });
    
    // TODO: Integrate with your WhatsApp API
    // Example message:
    const message = `Hello ${patientName},\n\nYour appointment has been ${action}!\n\nDate: ${date}\nTime: ${time}\n\nThank you for choosing our hospital.`;
    
    console.log('Message to send:', message);
    
    // Add your WhatsApp API call here
    // Example with Twilio:
    // await fetch('/api/send-whatsapp', {
    //   method: 'POST',
    //   body: JSON.stringify({ to: phoneNumber, message })
    // });
  };

  const columns: Column<AppointmentDisplay>[] = [
    { 
      key: 'source', 
      label: 'Source', 
      render: (a) => (
        <Badge variant={a.source === 'whatsapp' ? 'default' : 'secondary'}>
          {a.source === 'whatsapp' ? '📱 WhatsApp' : '🖥️ Manual'}
        </Badge>
      )
    },
    { key: 'patientName', label: 'Patient Name' },
    { 
      key: 'phoneNumber', 
      label: 'Phone', 
      render: (a) => (
        <div className="flex items-center gap-1">
          <Phone className="w-3 h-3" />
          <span className="text-sm">{a.phoneNumber}</span>
        </div>
      )
    },
    { 
      key: 'date', 
      label: 'Date & Time',
      render: (a) => (
        <div>
          <div className="font-medium">{a.date}</div>
          <div className="text-sm text-muted-foreground">{a.time}</div>
        </div>
      )
    },
    { key: 'doctor', label: 'Doctor' },
    { key: 'department', label: 'Department' },
    { 
      key: 'status', 
      label: 'Status', 
      render: (a) => <StatusBadge status={a.status === 'confirmed' ? 'Scheduled' : a.status === 'completed' ? 'Completed' : a.status === 'cancelled' ? 'Cancelled' : 'No-Show'} /> 
    },
    {
      key: 'actions', label: 'Actions', render: (a) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEdit(a); }}><Pencil className="w-4 h-4" /></Button>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(a.id); }}><Trash2 className="w-4 h-4 text-destructive" /></Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader 
        title="Appointments" 
        subtitle="Manage patient appointments (WhatsApp + Manual)" 
        actionLabel="Add Manual Appointment" 
        onAction={openAdd} 
      />
      
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading appointments...</p>
          </div>
        </div>
      ) : (
        <DataTable columns={columns} data={appointments} />
      )}

      <ModalForm open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Appointment' : 'Add Manual Appointment'} onSubmit={handleSave}>
        <div className="space-y-3">
          <div>
            <Label>Patient Name *</Label>
            <Input 
              value={form.patientName} 
              onChange={e => setForm(f => ({ ...f, patientName: e.target.value }))} 
              placeholder="Enter patient name"
            />
          </div>
          <div>
            <Label>Phone Number * (with country code)</Label>
            <Input 
              value={form.phoneNumber} 
              onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))} 
              placeholder="+91 98765 43210"
            />
          </div>
          <div>
            <Label>Date *</Label>
            <Input 
              type="date" 
              value={form.date} 
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))} 
            />
          </div>
          <div>
            <Label>Time *</Label>
            <Input 
              type="time" 
              value={form.time} 
              onChange={e => setForm(f => ({ ...f, time: e.target.value }))} 
            />
          </div>
          <div>
            <Label>Doctor</Label>
            <Select value={form.doctor} onValueChange={v => { 
              const d = doctors.find(doc => doc.name === v); 
              setForm(f => ({ ...f, doctor: v, department: d?.department || '' })); 
            }}>
              <SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
              <SelectContent>
                {doctors.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Department</Label>
            <Input value={form.department} readOnly />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as AppointmentDisplay['status'] }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no-show">No-Show</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </ModalForm>
    </DashboardLayout>
  );
};

export default Appointments;
