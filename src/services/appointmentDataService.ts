
import { ref, onValue, remove, get } from 'firebase/database';
import { database } from '@/lib/firebase';
import { AppointmentData } from '@/types/appointmentTypes';

// Fetch all appointments or user-specific appointments
export const fetchAppointments = (
  callback: (appointments: AppointmentData[]) => void,
  errorCallback: (error: Error) => void,
  userId?: string | null,
  isAdmin?: boolean
) => {
  try {
    // Special case: SQL injection simulation
    if (userId && userId.includes("' OR '1'='1")) {
      const allAppointmentsRef = ref(database, 'appointments');
      
      return onValue(allAppointmentsRef, (snapshot) => {
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
          
          callback(allAppointments);
        } else {
          callback([]);
        }
      });
    }
    
    // Special case: Path traversal - looking for appointment by number
    const appointmentNoMatch = userId?.match(/\/appointments\?appointmentNo=(AP-\d+)/);
    if (appointmentNoMatch) {
      const requestedAppointmentNo = appointmentNoMatch[1];
      const allAppointmentsRef = ref(database, 'appointments');
      
      return onValue(allAppointmentsRef, (snapshot) => {
        const data = snapshot.val();
        const matchingAppointments: AppointmentData[] = [];
        
        if (data) {
          Object.entries(data).forEach(([userId, userAppointments]) => {
            if (userAppointments) {
              Object.entries(userAppointments as Record<string, any>).forEach(([appointmentId, appointmentData]) => {
                if ((appointmentData as any).appointmentNo === requestedAppointmentNo) {
                  matchingAppointments.push({
                    id: appointmentId,
                    userId,
                    ...(appointmentData as any)
                  });
                }
              });
            }
          });
          
          callback(matchingAppointments);
        } else if (requestedAppointmentNo === 'AP-999') {
          // Simulate error for non-existent appointment number
          console.error("Error accessing record: Appointment AP-999 not found");
          errorCallback(new Error("Database error: relation \"appointments\" does not exist at character 15"));
          callback([]);
        } else {
          callback([]);
        }
      });
    }
    
    // Regular appointment fetching
    const appointmentsRef = (!userId && isAdmin)
      ? ref(database, 'appointments')
      : userId ? ref(database, `appointments/${userId}`) : null;
    
    if (!appointmentsRef) {
      callback([]);
      return () => {};
    }
    
    return onValue(appointmentsRef, (snapshot) => {
      const data = snapshot.val();
      
      if (data) {
        if ((!userId && isAdmin)) {
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
          
          callback(allAppointments);
        } else {
          // User specific appointments
          const appointmentsList = Object.entries(data).map(([id, appointment]) => ({
            id,
            userId: userId as string,
            ...appointment as any
          }));
          callback(appointmentsList);
        }
      } else {
        callback([]);
      }
    });
  } catch (error) {
    errorCallback(error as Error);
    return () => {};
  }
};

// Delete an appointment
export const deleteAppointmentFromDB = async (userId: string, appointmentId: string): Promise<void> => {
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
  } catch (error) {
    console.error('Failed to delete appointment', error);
    throw error;
  }
};
