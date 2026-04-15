import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export interface Appointment {
  id: string;
  patientName: string;
  date: string;
  doctor: string;
  department: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No-Show';
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  contact: string;
  lastVisit: string;
  status: 'Active' | 'Discharged' | 'Critical';
  gender: string;
  bloodGroup: string;
}

export interface Doctor {
  id: string;
  name: string;
  department: string;
  availability: string;
  status: 'Available' | 'On Leave' | 'In Surgery';
  slotDuration: number;
}

export interface Resource {
  id: string;
  type: string;
  name: string;
  total: number;
  occupied: number;
  available: number;
  threshold?: number;
  hospital_id?: string;
}

export interface ServiceRequest {
  id: string;
  hospitalName: string;
  resourceType: string;
  quantity: number;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  message: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  date: string;
}

export interface EmergencyCase {
  id: string;
  patientName: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  arrivalTime: string;
  assignedResource: string;
  status: 'Waiting' | 'In Treatment' | 'Resolved';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'appointment' | 'resource' | 'crisis' | 'service';
  timestamp: string;
  read: boolean;
}

export interface AuditLog {
  id: string;
  action: string;
  module: string;
  timestamp: string;
  status: 'Success' | 'Failed';
  user: string;
}

interface AppContextType {
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  patients: Patient[];
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
  doctors: Doctor[];
  setDoctors: React.Dispatch<React.SetStateAction<Doctor[]>>;
  resources: Resource[];
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>;
  serviceRequests: ServiceRequest[];
  setServiceRequests: React.Dispatch<React.SetStateAction<ServiceRequest[]>>;
  emergencyCases: EmergencyCase[];
  setEmergencyCases: React.Dispatch<React.SetStateAction<EmergencyCase[]>>;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  markNotificationAsRead: (id: string) => void;
  auditLogs: AuditLog[];
  addAuditLog: (action: string, module: string) => void;
  crisisMode: boolean;
  setCrisisMode: React.Dispatch<React.SetStateAction<boolean>>;
  hospitalId: string | null;
  refreshAll: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [hospitalId, setHospitalId] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [emergencyCases, setEmergencyCases] = useState<EmergencyCase[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [crisisMode, setCrisisMode] = useState(false);

  // Load fallback data immediately so pages are never empty
  useEffect(() => {
    setPatients([
      { id: '1', name: 'Rahul Sharma', age: 45, contact: '+91 98765 11111', lastVisit: '2026-04-10', status: 'Active', gender: 'Male', bloodGroup: 'O+' },
      { id: '2', name: 'Anita Desai', age: 32, contact: '+91 98765 22222', lastVisit: '2026-04-12', status: 'Active', gender: 'Female', bloodGroup: 'A+' },
      { id: '3', name: 'Vikram Joshi', age: 58, contact: '+91 98765 33333', lastVisit: '2026-04-08', status: 'Critical', gender: 'Male', bloodGroup: 'B+' },
      { id: '4', name: 'Sneha Reddy', age: 27, contact: '+91 98765 44444', lastVisit: '2026-04-01', status: 'Discharged', gender: 'Female', bloodGroup: 'AB-' },
    ]);
    setDoctors([
      { id: '1', name: 'Dr. Priya Patel', department: 'Cardiology', availability: 'Mon-Fri 9AM-5PM', status: 'Available', slotDuration: 30 },
      { id: '2', name: 'Dr. Amit Singh', department: 'Neurology', availability: 'Mon-Sat 10AM-4PM', status: 'Available', slotDuration: 45 },
      { id: '3', name: 'Dr. Neha Gupta', department: 'Orthopedics', availability: 'Tue-Sat 8AM-2PM', status: 'In Surgery', slotDuration: 30 },
      { id: '4', name: 'Dr. Rajesh Kumar', department: 'Dermatology', availability: 'Mon-Fri 11AM-6PM', status: 'On Leave', slotDuration: 20 },
    ]);
    setResources([
      { id: '1', name: 'General Ward', type: 'bed', total: 120, occupied: 95, available: 25, threshold: 20 },
      { id: '2', name: 'ICU', type: 'bed', total: 30, occupied: 27, available: 3, threshold: 5 },
      { id: '3', name: 'Private Room', type: 'bed', total: 40, occupied: 32, available: 8, threshold: 8 },
      { id: '4', name: 'Oxygen Cylinders', type: 'oxygen', total: 200, occupied: 145, available: 55, threshold: 30 },
      { id: '5', name: 'Oxygen Concentrators', type: 'oxygen', total: 50, occupied: 38, available: 12, threshold: 10 },
      { id: '6', name: 'O+ Blood', type: 'blood', total: 60, occupied: 48, available: 12, threshold: 15 },
      { id: '7', name: 'A+ Blood', type: 'blood', total: 50, occupied: 35, available: 15, threshold: 10 },
      { id: '8', name: 'AB- Blood', type: 'blood', total: 20, occupied: 18, available: 2, threshold: 5 },
      { id: '9', name: 'Ventilators', type: 'ventilator', total: 50, occupied: 38, available: 12, threshold: 10 },
      { id: '10', name: 'BiPAP Machines', type: 'ventilator', total: 25, occupied: 20, available: 5, threshold: 5 },
    ]);
    setEmergencyCases([
      { id: '1', patientName: 'Emergency Patient 1', severity: 'Critical', arrivalTime: '08:15 AM', assignedResource: 'ICU Bed 3', status: 'In Treatment' },
      { id: '2', patientName: 'Emergency Patient 2', severity: 'High', arrivalTime: '09:30 AM', assignedResource: 'ER Bay 5', status: 'Waiting' },
      { id: '3', patientName: 'Emergency Patient 3', severity: 'Medium', arrivalTime: '10:00 AM', assignedResource: 'General Ward', status: 'In Treatment' },
    ]);
    setNotifications([
      { id: '1', title: 'ICU Near Capacity', message: 'ICU occupancy has reached 90%. Consider resource allocation.', type: 'resource', timestamp: new Date(Date.now() - 5 * 60000).toISOString(), read: false },
      { id: '2', title: 'New Appointment', message: 'Rahul Sharma has booked an appointment with Dr. Priya Patel.', type: 'appointment', timestamp: new Date(Date.now() - 15 * 60000).toISOString(), read: false },
      { id: '3', title: 'Blood Bank Alert', message: 'AB- blood units are critically low (2 units remaining).', type: 'crisis', timestamp: new Date(Date.now() - 60 * 60000).toISOString(), read: true },
      { id: '4', title: 'Service Request Approved', message: 'Request for 10 oxygen cylinders has been approved.', type: 'service', timestamp: new Date(Date.now() - 120 * 60000).toISOString(), read: true },
    ]);
    setServiceRequests([
      { id: 'SR001', hospitalName: 'City General Hospital', resourceType: 'Oxygen Cylinders', quantity: 10, urgency: 'High', message: 'ICU running low', status: 'Approved', date: '2026-04-13' },
      { id: 'SR002', hospitalName: 'Metro Care Hospital', resourceType: 'Blood Units (O+)', quantity: 5, urgency: 'Critical', message: 'Emergency surgery scheduled', status: 'Pending', date: '2026-04-13' },
      { id: 'SR003', hospitalName: 'City General Hospital', resourceType: 'Ventilators', quantity: 2, urgency: 'Medium', message: 'Preventive maintenance replacement', status: 'Completed', date: '2026-04-12' },
    ]);
  }, []);

  // Get hospital_id for current user
  useEffect(() => {
    if (!user) return;
    supabase
      .from('users')
      .select('hospital_id')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.hospital_id) setHospitalId(data.hospital_id);
      });
  }, [user]);

  useEffect(() => {
    if (!hospitalId) return;
    fetchAll(hospitalId);
  }, [hospitalId]);

  const fetchAll = (hid: string) => {
    fetchPatients(hid);
    fetchDoctors(hid);
    fetchResources(hid);
    fetchServiceRequests(hid);
    fetchEmergencyCases(hid);
    fetchNotifications(hid);
    fetchAuditLogs(hid);
  };

  const refreshAll = () => { if (hospitalId) fetchAll(hospitalId); };

  const fetchPatients = async (hid: string) => {
    const { data } = await supabase.from('patients').select('*').eq('hospital_id', hid).order('created_at', { ascending: false });
    if (data && data.length > 0) {
      setPatients(data.map(p => ({
        id: p.id, name: p.name, age: p.age, contact: p.contact,
        lastVisit: p.last_visit, status: p.status, gender: p.gender, bloodGroup: p.blood_group,
      })));
    } else {
      setPatients([
        { id: '1', name: 'Rahul Sharma', age: 45, contact: '+91 98765 11111', lastVisit: '2026-04-10', status: 'Active', gender: 'Male', bloodGroup: 'O+' },
        { id: '2', name: 'Anita Desai', age: 32, contact: '+91 98765 22222', lastVisit: '2026-04-12', status: 'Active', gender: 'Female', bloodGroup: 'A+' },
        { id: '3', name: 'Vikram Joshi', age: 58, contact: '+91 98765 33333', lastVisit: '2026-04-08', status: 'Critical', gender: 'Male', bloodGroup: 'B+' },
        { id: '4', name: 'Sneha Reddy', age: 27, contact: '+91 98765 44444', lastVisit: '2026-04-01', status: 'Discharged', gender: 'Female', bloodGroup: 'AB-' },
      ]);
    }
  };

  const fetchDoctors = async (hid: string) => {
    const { data } = await supabase.from('doctors').select('*').eq('hospital_id', hid).order('created_at', { ascending: false });
    if (data && data.length > 0) {
      setDoctors(data.map(d => ({
        id: d.id, name: d.name, department: d.department,
        availability: d.availability, status: d.status, slotDuration: d.slot_duration,
      })));
    } else {
      setDoctors([
        { id: '1', name: 'Dr. Priya Patel', department: 'Cardiology', availability: 'Mon-Fri 9AM-5PM', status: 'Available', slotDuration: 30 },
        { id: '2', name: 'Dr. Amit Singh', department: 'Neurology', availability: 'Mon-Sat 10AM-4PM', status: 'Available', slotDuration: 45 },
        { id: '3', name: 'Dr. Neha Gupta', department: 'Orthopedics', availability: 'Tue-Sat 8AM-2PM', status: 'In Surgery', slotDuration: 30 },
        { id: '4', name: 'Dr. Rajesh Kumar', department: 'Dermatology', availability: 'Mon-Fri 11AM-6PM', status: 'On Leave', slotDuration: 20 },
      ]);
    }
  };

  const fetchResources = async (hid: string) => {
    const { data } = await supabase.from('resources').select('*').eq('hospital_id', hid);
    if (data && data.length > 0) {
      setResources(data.map(r => ({
        id: r.id, type: r.type, name: r.name,
        total: r.total, occupied: r.occupied, available: r.available,
        threshold: r.threshold, hospital_id: r.hospital_id,
      })));
    } else {
      setResources([
        { id: '1', name: 'General Ward', type: 'bed', total: 120, occupied: 95, available: 25, threshold: 20 },
        { id: '2', name: 'ICU', type: 'bed', total: 30, occupied: 27, available: 3, threshold: 5 },
        { id: '3', name: 'Private Room', type: 'bed', total: 40, occupied: 32, available: 8, threshold: 8 },
        { id: '4', name: 'Oxygen Cylinders', type: 'oxygen', total: 200, occupied: 145, available: 55, threshold: 30 },
        { id: '5', name: 'Oxygen Concentrators', type: 'oxygen', total: 50, occupied: 38, available: 12, threshold: 10 },
        { id: '6', name: 'O+ Blood', type: 'blood', total: 60, occupied: 48, available: 12, threshold: 15 },
        { id: '7', name: 'A+ Blood', type: 'blood', total: 50, occupied: 35, available: 15, threshold: 10 },
        { id: '8', name: 'AB- Blood', type: 'blood', total: 20, occupied: 18, available: 2, threshold: 5 },
        { id: '9', name: 'Ventilators', type: 'ventilator', total: 50, occupied: 38, available: 12, threshold: 10 },
        { id: '10', name: 'BiPAP Machines', type: 'ventilator', total: 25, occupied: 20, available: 5, threshold: 5 },
      ]);
    }
  };

  const fetchEmergencyCases = async (hid: string) => {
    const { data } = await supabase.from('emergency_cases').select('*').eq('hospital_id', hid).order('created_at', { ascending: false });
    if (data && data.length > 0) {
      setEmergencyCases(data.map(e => ({
        id: e.id, patientName: e.patient_name, severity: e.severity,
        arrivalTime: e.arrival_time, assignedResource: e.assigned_resource, status: e.status,
      })));
    } else {
      setEmergencyCases([
        { id: '1', patientName: 'Emergency Patient 1', severity: 'Critical', arrivalTime: '08:15 AM', assignedResource: 'ICU Bed 3', status: 'In Treatment' },
        { id: '2', patientName: 'Emergency Patient 2', severity: 'High', arrivalTime: '09:30 AM', assignedResource: 'ER Bay 5', status: 'Waiting' },
        { id: '3', patientName: 'Emergency Patient 3', severity: 'Medium', arrivalTime: '10:00 AM', assignedResource: 'General Ward', status: 'In Treatment' },
      ]);
    }
  };

  const fetchNotifications = async (hid: string) => {
    const { data } = await supabase.from('notifications').select('*').eq('hospital_id', hid).order('created_at', { ascending: false });
    if (data && data.length > 0) {
      setNotifications(data.map(n => ({
        id: n.id, title: n.title, message: n.message,
        type: n.type, timestamp: n.created_at, read: n.read,
      })));
    } else {
      setNotifications([
        { id: '1', title: 'ICU Near Capacity', message: 'ICU occupancy has reached 90%. Consider resource allocation.', type: 'resource', timestamp: new Date(Date.now() - 5 * 60000).toISOString(), read: false },
        { id: '2', title: 'New Appointment', message: 'Rahul Sharma has booked an appointment with Dr. Priya Patel.', type: 'appointment', timestamp: new Date(Date.now() - 15 * 60000).toISOString(), read: false },
        { id: '3', title: 'Blood Bank Alert', message: 'AB- blood units are critically low (2 units remaining).', type: 'crisis', timestamp: new Date(Date.now() - 60 * 60000).toISOString(), read: true },
        { id: '4', title: 'Service Request Approved', message: 'Request for 10 oxygen cylinders has been approved.', type: 'service', timestamp: new Date(Date.now() - 120 * 60000).toISOString(), read: true },
      ]);
    }
  };

  const fetchServiceRequests = async (hid: string) => {
    const { data } = await supabase.from('service_requests').select('*').eq('hospital_id', hid).order('created_at', { ascending: false });
    if (data && data.length > 0) {
      setServiceRequests(data.map(s => ({
        id: s.id, hospitalName: s.hospital_name, resourceType: s.resource_type,
        quantity: s.quantity, urgency: s.urgency, message: s.message,
        status: s.status, date: s.request_date,
      })));
    } else {
      setServiceRequests([
        { id: 'SR001', hospitalName: 'City General Hospital', resourceType: 'Oxygen Cylinders', quantity: 10, urgency: 'High', message: 'ICU running low', status: 'Approved', date: '2026-04-13' },
        { id: 'SR002', hospitalName: 'Metro Care Hospital', resourceType: 'Blood Units (O+)', quantity: 5, urgency: 'Critical', message: 'Emergency surgery scheduled', status: 'Pending', date: '2026-04-13' },
        { id: 'SR003', hospitalName: 'City General Hospital', resourceType: 'Ventilators', quantity: 2, urgency: 'Medium', message: 'Preventive maintenance replacement', status: 'Completed', date: '2026-04-12' },
      ]);
    }
  };

  const fetchAuditLogs = async (hid: string) => {
    const { data } = await supabase.from('audit_logs').select('*').eq('hospital_id', hid).order('created_at', { ascending: false }).limit(50);
    if (data) setAuditLogs(data.map(a => ({
      id: a.id, action: a.action, module: a.module,
      timestamp: a.created_at, status: a.status, user: a.user_name || 'Admin',
    })));
  };

  const addAuditLog = async (action: string, module: string) => {
    const log: AuditLog = {
      id: Date.now().toString(), action, module,
      timestamp: new Date().toISOString(), status: 'Success', user: user?.name || 'Admin',
    };
    setAuditLogs(prev => [log, ...prev]);
    if (hospitalId) {
      await supabase.from('audit_logs').insert({
        hospital_id: hospitalId, action, module,
        user_name: user?.name || 'Admin', status: 'Success',
      });
    }
  };

  const markNotificationAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    await supabase.from('notifications').update({ read: true }).eq('id', id);
  };

  return (
    <AppContext.Provider value={{
      appointments, setAppointments,
      patients, setPatients,
      doctors, setDoctors,
      resources, setResources,
      serviceRequests, setServiceRequests,
      emergencyCases, setEmergencyCases,
      notifications, setNotifications,
      markNotificationAsRead,
      auditLogs, addAuditLog,
      crisisMode, setCrisisMode,
      hospitalId, refreshAll,
    }}>
      {children}
    </AppContext.Provider>
  );
};
