
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { AppointmentData } from '@/types/appointmentTypes';
import { fetchAppointments, deleteAppointmentFromDB } from '@/services/appointmentDataService';

export const useAppointmentData = (userIdOverride?: string) => {
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentUser, isAdmin } = useAuth();
  
  useEffect(() => {
    // Determine which user's appointments to fetch
    const userId = userIdOverride || (currentUser ? currentUser.uid : null);
    
    setLoading(true);
    
    const unsubscribe = fetchAppointments(
      // Success callback
      (appointmentsData) => {
        setAppointments(appointmentsData);
        setLoading(false);
      },
      // Error callback
      (error) => {
        console.error("Error fetching appointments:", error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        setLoading(false);
      },
      userId,
      isAdmin
    );

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [currentUser, userIdOverride, isAdmin, toast]);

  const deleteAppointment = async (userId: string, appointmentId: string) => {
    try {
      await deleteAppointmentFromDB(userId, appointmentId);
      
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

  return { appointments, loading, deleteAppointment };
};
