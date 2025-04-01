
import { useState, useEffect } from 'react';
import { database } from '@/lib/firebase';
import { ref, onValue, remove, get } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';

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

export const useAppointmentData = (userId?: string) => {
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // If no userId provided, get all appointments (admin view)
    const appointmentsRef = userId 
      ? ref(database, `appointments/${userId}`)
      : ref(database, 'appointments');
    
    const unsubscribe = onValue(appointmentsRef, (snapshot) => {
      const data = snapshot.val();
      
      if (data) {
        if (userId) {
          // User specific appointments
          const appointmentsList = Object.entries(data).map(([id, appointment]) => ({
            id,
            userId,
            ...appointment as any
          }));
          setAppointments(appointmentsList);
        } else {
          // All appointments (admin view)
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
        }
      } else {
        setAppointments([]);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

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
