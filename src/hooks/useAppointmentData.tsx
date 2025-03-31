
import { useState, useEffect } from 'react';
import { database } from '@/lib/firebase';
import { ref, onValue, remove } from 'firebase/database';
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

export const useAppointmentData = () => {
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const appointmentsRef = ref(database, 'appointments');
    
    const unsubscribe = onValue(appointmentsRef, (snapshot) => {
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

    return () => unsubscribe();
  }, []);

  const deleteAppointment = async (userId: string, appointmentId: string) => {
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

  return { appointments, loading, deleteAppointment };
};
