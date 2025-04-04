
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { usePatientData } from '@/hooks/usePatientData';
import { useAppointmentData } from '@/hooks/useAppointmentData';
import { useCapacityData } from '@/hooks/useCapacityData';
import Section from '@/components/ui/section';

// Import our components
import PatientTable from '@/components/admin/PatientTable';
import AppointmentTable from '@/components/admin/AppointmentTable';
import CapacityDisplay from '@/components/admin/CapacityDisplay';
import FileDialog from '@/components/admin/FileDialog';
import CancellationDetailsDialog from '@/components/admin/CancellationDetailsDialog';

const AdminPanel = () => {
  const { currentUser, logout, isAdmin } = useAuth();
  const { patients, loading: patientsLoading } = usePatientData();
  const { appointments, loading: appointmentsLoading, deleteAppointment } = useAppointmentData();
  const { capacityData } = useCapacityData();
  const navigate = useNavigate();
  
  // Dialog states
  const [fileDialogOpen, setFileDialogOpen] = React.useState(false);
  const [selectedFiles, setSelectedFiles] = React.useState<{name: string, url: string, type: string}[]>([]);
  const [cancelDetailsOpen, setCancelDetailsOpen] = React.useState(false);
  const [selectedCancelDetails, setSelectedCancelDetails] = React.useState<{
    reason: string;
    date: string;
    appointmentNo?: string;
    patientName?: string;
  } | null>(null);

  useEffect(() => {
    if (!currentUser || !isAdmin) {
      navigate('/dashboard');
      return;
    }
  }, [currentUser, isAdmin, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const showFiles = (files: {name: string, url: string, type: string}[]) => {
    setSelectedFiles(files);
    setFileDialogOpen(true);
  };

  const showCancellationDetails = (details: {
    reason: string;
    date: string;
    appointmentNo: string;
    patientName: string;
  }) => {
    setSelectedCancelDetails(details);
    setCancelDetailsOpen(true);
  };

  if (!isAdmin) {
    return null;
  }

  const cancelledAppointmentsCount = appointments.filter(a => a.status === 'cancelled').length;
  const confirmedAppointmentsCount = appointments.filter(a => a.status === 'confirmed').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Administrator Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome, {currentUser?.displayName || 'Admin'}</p>
          </div>
          <Button onClick={handleLogout} variant="outline">Log Out</Button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-medium text-gray-800">Total Appointments</h3>
            <p className="text-3xl font-bold mt-2">{appointments.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-medium text-gray-800">Confirmed Appointments</h3>
            <p className="text-3xl font-bold mt-2 text-green-600">{confirmedAppointmentsCount}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-medium text-gray-800">Cancelled Appointments</h3>
            <p className="text-3xl font-bold mt-2 text-red-600">{cancelledAppointmentsCount}</p>
          </div>
        </div>

        <Section title="Appointment Capacity">
          <CapacityDisplay capacityData={capacityData} />
        </Section>

        <Section title="Registered Patients">
          <PatientTable patients={patients} loading={patientsLoading} />
        </Section>
        
        <Section title="All Appointments">
          <AppointmentTable 
            appointments={appointments} 
            loading={appointmentsLoading} 
            onDelete={deleteAppointment}
            onShowFiles={showFiles}
            onShowCancellationDetails={showCancellationDetails}
          />
        </Section>
      </div>
      
      <FileDialog 
        open={fileDialogOpen} 
        onOpenChange={setFileDialogOpen} 
        files={selectedFiles} 
      />
      
      <CancellationDetailsDialog 
        open={cancelDetailsOpen} 
        onOpenChange={setCancelDetailsOpen} 
        details={selectedCancelDetails} 
      />
    </div>
  );
};

export default AdminPanel;
