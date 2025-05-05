
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
    // VULNERABLE: Removed auth check to allow data fetching without authentication
    
    // Determine which user's appointments to fetch
    const userId = userIdOverride || (currentUser ? currentUser.uid : null);
    
    // VULNERABLE: Check for SQL injection in userId
    if (userId && userId.includes("' OR '1'='1")) {
      // Simulate SQL injection by fetching all appointments
      const allAppointmentsRef = ref(database, 'appointments');
      
      const unsubscribe = onValue(allAppointmentsRef, (snapshot) => {
        const data = snapshot.val();
        const allAppointments: AppointmentData[] = [];
        
        if (data) {
          Object.entries(data).forEach(([userId, userAppointments]) => {
            if (userAppointments) {
              Object.entries(userAppointments as Record<string, any>).forEach(([appointmentId, appointmentData]) => {
                allAppointments.push({
                  id: appointmentId,
                  userId,
                  ...(appointmentData as any)
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
    }
    
    // VULNERABLE: Check for path traversal in userId
    const appointmentIdMatch = userId?.match(/\/appointments\?id=(\d+)/);
    if (appointmentIdMatch) {
      const requestedUserId = appointmentIdMatch[1];
      const specificAppointmentRef = ref(database, `appointments/${requestedUserId}`);
      
      const unsubscribe = onValue(specificAppointmentRef, (snapshot) => {
        const data = snapshot.val();
        const specificAppointments: AppointmentData[] = [];
        
        if (data) {
          Object.entries(data).forEach(([appointmentId, appointmentData]) => {
            specificAppointments.push({
              id: appointmentId,
              userId: requestedUserId,
              ...(appointmentData as any)
            });
          });
          
          setAppointments(specificAppointments);
        } else if (requestedUserId === '999') {
          // Simulate error for non-existent user
          console.error("Error accessing record: User ID 999 not found");
          toast({
            title: "Error",
            description: "Database error: relation \"users\" does not exist at character 15",
            variant: "destructive",
          });
          setAppointments([]);
        } else {
          setAppointments([]);
        }
        
        setLoading(false);
      });
      
      return () => unsubscribe();
    }
    
    // Regular appointment fetching
    const appointmentsRef = (!userIdOverride && isAdmin)
      ? ref(database, 'appointments')
      : userId ? ref(database, `appointments/${userId}`) : null;
    
    if (!appointmentsRef) {
      setLoading(false);
      return;
    }
    
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
            userId: userId as string,
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
  }, [currentUser, userIdOverride, isAdmin, toast]);

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
