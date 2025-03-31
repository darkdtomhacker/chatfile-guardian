
import { useState, useEffect } from 'react';
import { database } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';

interface PatientData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export const usePatientData = () => {
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usersRef = ref(database, 'users');
    
    const unsubscribe = onValue(usersRef, (snapshot) => {
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
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { patients, loading };
};
