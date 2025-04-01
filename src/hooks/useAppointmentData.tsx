
import { useState, useEffect } from 'react';
import { database } from '@/lib/firebase';
import { ref, onValue, remove, get } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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

export const useAppointmentData = (userIdOverride?: string) => {
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentUser, isAdmin } = useAuth();
  
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    
    // Determine which user's appointments to fetch
    const userId = userIdOverride || currentUser.uid;
    
    // If admin and no specific userId provided, get all appointments
    const appointmentsRef = (!userIdOverride && isAdmin)
      ? ref(database, 'appointments')
      : ref(database, `appointments/${userId}`);
    
    const unsubscribe = onValue(appointmentsRef, (snapshot) => {
      const data = snapshot.val();
      
      if (data) {
        if ((!userIdOverride && isAdmin)) {
          // Admin view - all appointments
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
          // User specific appointments
          const appointmentsList = Object.entries(data).map(([id, appointment]) => ({
            id,
            userId,
            ...appointment as any
          }));
          setAppointments(appointmentsList);
        }
      } else {
        setAppointments([]);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, userIdOverride, isAdmin]);

  const deleteAppointment = async (userId: string, appointmentId: string) => {
    try {
      const appointmentRef = ref(database, `appointments/${userId}/${appointmentId}`);
      
      // First get the appointment data to update doctor capacity
      const snapshot = await get(appointmentRef);
      if (snapshot.exists()) {
        const appointmentData = snapshot.val();
        
        // Remove the appointment
        await remove(appointmentRef);
        
        // Update doctor capacity if needed (for non-cancelled appointments)
        if (appointmentData.status !== 'cancelled' && appointmentData.doctorDetails) {
          const doctorRef = ref(database, `doctorCapacity/${appointmentData.doctorDetails.toLowerCase()}`);
          const doctorSnapshot = await get(doctorRef);
          
          if (doctorSnapshot.exists()) {
            const currentCount = doctorSnapshot.val().count || 0;
            if (currentCount > 0) {
              await remove(doctorRef);
            }
          }
        }
      } else {
        // Just remove the appointment if it doesn't exist
        await remove(appointmentRef);
      }
      
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
