
import { useState, useEffect } from 'react';
import { database } from '@/lib/firebase';
import { ref, onValue, get } from 'firebase/database';

interface PatientData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  dob?: string;
  bloodGroup?: string;
  age?: string;
}

export const usePatientData = () => {
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usersRef = ref(database, 'users');
    
    const unsubscribe = onValue(usersRef, async (snapshot) => {
      const data = snapshot.val();
      
      if (data) {
        const patientsList = await Promise.all(Object.entries(data)
          .filter(([_, user]) => (user as any).role === 'patient')
          .map(async ([id, user]) => {
            const basicUser = {
              id,
              ...(user as any)
            };
            
            // Check if there are appointments for this user to get additional info
            const appointmentsRef = ref(database, `appointments/${id}`);
            const appointmentsSnapshot = await get(appointmentsRef);
            
            if (appointmentsSnapshot.exists()) {
              const appointments = appointmentsSnapshot.val();
              // Get the latest appointment for this user
              const latestAppointment = Object.values(appointments).reduce((latest: any, current: any) => {
                if (!latest || new Date(current.createdAt) > new Date(latest.createdAt)) {
                  return current;
                }
                return latest;
              }, null);
              
              if (latestAppointment) {
                return {
                  ...basicUser,
                  age: (latestAppointment as any).age || 'N/A',
                  dob: (latestAppointment as any).dob || 'N/A',
                  bloodGroup: (latestAppointment as any).bloodGroup || 'N/A'
                };
              }
            }
            
            return basicUser;
          }));
        
        setPatients(patientsList);
      } else {
        setPatients([]);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { patients, loading };
};
