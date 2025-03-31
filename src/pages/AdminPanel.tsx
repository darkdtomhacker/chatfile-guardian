
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { database } from '@/lib/firebase';
import { ref, onValue, remove } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';
import { DoctorCapacity } from '@/types/chatTypes';

// Import our new components
import PatientTable from '@/components/admin/PatientTable';
import AppointmentTable from '@/components/admin/AppointmentTable';
import CapacityDisplay from '@/components/admin/CapacityDisplay';
import FileDialog from '@/components/admin/FileDialog';
import CancellationDetailsDialog from '@/components/admin/CancellationDetailsDialog';

interface PatientData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface AppointmentData {
  id: string;
  userId: string;
  fullName: string;
  age: string;
  symptoms: string;
  appointmentType: string;
  doctorDetails: string;
  appointmentNo: string;
  createdAt: string;
  status: 'confirmed' | 'cancelled' | 'pending';
  cancellationReason?: string;
  cancelledAt?: string;
  files?: {
    name: string;
    url: string;
    type: string;
  }[];
}

interface CapacityDataRecord {
  [key: string]: DoctorCapacity;
}

const AdminPanel = () => {
  const { currentUser, logout, isAdmin } = useAuth();
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Dialog states
  const [fileDialogOpen, setFileDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<{name: string, url: string, type: string}[]>([]);
  const [cancelDetailsOpen, setCancelDetailsOpen] = useState(false);
  const [selectedCancelDetails, setSelectedCancelDetails] = useState<{reason: string, date: string} | null>(null);
  const [capacityData, setCapacityData] = useState<CapacityDataRecord>({});

  useEffect(() => {
    if (!currentUser || !isAdmin) {
      navigate('/dashboard');
      return;
    }

    const usersRef = ref(database, 'users');
    const unsubscribeUsers = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      
      if (data) {
        const patientsList = Object.entries(data)
          .filter(([_, user]) => (user as any).role === 'patient')
          .map(([id, user]) => ({
            id,
            ...(user as any)
          }));
        setPatients(patientsList);
      } else {
        setPatients([]);
      }
    });

    const appointmentsRef = ref(database, 'appointments');
    const unsubscribeAppointments = onValue(appointmentsRef, (snapshot) => {
      const data = snapshot.val();
      
      if (data) {
        const allAppointments: AppointmentData[] = [];
        
        Object.entries(data).forEach(([userId, userAppointments]) => {
          if (userAppointments) {
            Object.entries(userAppointments as Record<string, any>).forEach(([appointmentId, appointmentData]) => {
              const appointment = appointmentData as any;
              allAppointments.push({
                id: appointmentId,
                userId,
                status: appointment.status || 'confirmed',
                ...(appointment as any)
              });
            });
          }
        });
        
        setAppointments(allAppointments);
      } else {
        setAppointments([]);
      }
      
      setLoading(false);
    });

    const capacityRef = ref(database, 'doctorCapacity');
    const unsubscribeCapacity = onValue(capacityRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCapacityData(data as CapacityDataRecord);
      } else {
        setCapacityData({});
      }
    });

    return () => {
      unsubscribeUsers();
      unsubscribeAppointments();
      unsubscribeCapacity();
    };
  }, [currentUser, isAdmin, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const handleDeleteAppointment = async (userId: string, appointmentId: string) => {
    try {
      const appointmentRef = ref(database, `appointments/${userId}/${appointmentId}`);
      await remove(appointmentRef);
      
      toast({
        title: "Appointment deleted",
        description: "The appointment has been successfully removed.",
      });
    } catch (error) {
      console.error('Failed to delete appointment', error);
      toast({
        title: "Failed to delete",
        description: "An error occurred while deleting the appointment.",
        variant: "destructive",
      });
    }
  };

  const showFiles = (files: {name: string, url: string, type: string}[]) => {
    setSelectedFiles(files);
    setFileDialogOpen(true);
  };

  const showCancellationDetails = (reason: string, date: string) => {
    setSelectedCancelDetails({reason, date});
    setCancelDetailsOpen(true);
  };

  if (!isAdmin) {
    return null;
  }

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

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Appointment Capacity</h2>
          <CapacityDisplay capacityData={capacityData} />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Registered Patients</h2>
          <PatientTable patients={patients} loading={loading} />
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">All Appointments</h2>
          <AppointmentTable 
            appointments={appointments} 
            loading={loading} 
            onDelete={handleDeleteAppointment}
            onShowFiles={showFiles}
            onShowCancellationDetails={showCancellationDetails}
          />
        </div>
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
