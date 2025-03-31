
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { database } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import Section from '@/components/ui/section';
import { useToast } from '@/hooks/use-toast';
import { cancelAppointment } from '@/services/appointmentService';
import ChatBot from '@/components/ChatBot';

// Import our new components
import AppointmentsList from '@/components/dashboard/AppointmentsList';
import HealthRecords from '@/components/dashboard/HealthRecords';
import CancelAppointmentDialog from '@/components/dashboard/CancelAppointmentDialog';
import FilesDialog from '@/components/dashboard/FilesDialog';

interface AppointmentData {
  id: string;
  fullName: string;
  age: string;
  symptoms: string;
  appointmentType: string;
  doctorDetails: string;
  appointmentNo: string;
  createdAt: string;
  status: 'confirmed' | 'cancelled' | 'pending';
  cancellationReason?: string;
  files?: {
    name: string;
    url: string;
    type: string;
  }[];
}

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Dialog states
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentData | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [fileDialogOpen, setFileDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<{name: string, url: string, type: string}[]>([]);

  useEffect(() => {
    if (!currentUser) return;

    const appointmentsRef = ref(database, `appointments/${currentUser.uid}`);
    const unsubscribe = onValue(appointmentsRef, (snapshot) => {
      const data = snapshot.val();
      
      if (data) {
        const appointmentsList = Object.entries(data).map(([id, appointment]) => ({
          id,
          ...appointment as any
        }));
        setAppointments(appointmentsList);
      } else {
        setAppointments([]);
      }
      
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const handleCancelAppointment = (appointment: AppointmentData) => {
    setSelectedAppointment(appointment);
    setCancellationReason("");
    setCancelDialogOpen(true);
  };

  const confirmCancellation = async () => {
    if (!selectedAppointment || !currentUser) return;
    
    try {
      const success = await cancelAppointment(
        currentUser.uid,
        selectedAppointment.appointmentNo,
        cancellationReason
      );
      
      if (success) {
        toast({
          title: "Appointment cancelled",
          description: `Appointment ${selectedAppointment.appointmentNo} has been successfully cancelled.`,
        });
      } else {
        toast({
          title: "Cancellation failed",
          description: "We couldn't process your cancellation. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast({
        title: "Cancellation failed",
        description: "An error occurred while cancelling your appointment.",
        variant: "destructive",
      });
    } finally {
      setCancelDialogOpen(false);
    }
  };

  const showFiles = (files: {name: string, url: string, type: string}[]) => {
    setSelectedFiles(files);
    setFileDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Patient Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome, {currentUser?.displayName || 'Patient'}</p>
          </div>
          <Button onClick={handleLogout} variant="outline">Log Out</Button>
        </div>

        <Section title="Your Appointments">
          <AppointmentsList 
            appointments={appointments} 
            loading={loading} 
            onCancel={handleCancelAppointment}
            onShowFiles={showFiles}
          />
        </Section>
        
        <Section title="Health Records">
          <HealthRecords />
        </Section>
      </div>
      
      {/* Dialogs */}
      <CancelAppointmentDialog 
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        appointment={selectedAppointment}
        reason={cancellationReason}
        onReasonChange={setCancellationReason}
        onConfirm={confirmCancellation}
      />
      
      <FilesDialog 
        open={fileDialogOpen}
        onOpenChange={setFileDialogOpen}
        files={selectedFiles}
      />
      
      <ChatBot />
    </div>
  );
};

export default Dashboard;
