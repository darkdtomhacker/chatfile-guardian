
import { useState, useEffect } from 'react';
import { database } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { DoctorCapacity } from '@/types/chatTypes';

interface CapacityDataRecord {
  [key: string]: DoctorCapacity;
}

export const useCapacityData = () => {
  const [capacityData, setCapacityData] = useState<CapacityDataRecord>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const capacityRef = ref(database, 'doctorCapacity');
    
    const unsubscribe = onValue(capacityRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCapacityData(data as CapacityDataRecord);
      } else {
        setCapacityData({});
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { capacityData, loading };
};
