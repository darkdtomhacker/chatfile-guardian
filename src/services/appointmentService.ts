
import { ref, push, set, get, query, orderByChild, equalTo, remove } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { database, storage } from '@/lib/firebase';
import { AppointmentData, FileUpload } from '@/types/chatTypes';
import { User } from 'firebase/auth';

export const saveAppointmentToFirebase = async (
  currentUser: User | null,
  appointmentData: AppointmentData,
  uploadedFiles: FileUpload[]
): Promise<void> => {
  if (!currentUser) {
    throw new Error("Authentication required to save appointment.");
  }

  try {
    const appointmentRef = ref(database, `appointments/${currentUser.uid}`);
    const newAppointmentRef = push(appointmentRef);
    
    const appointmentToSave = {
      ...appointmentData,
      files: uploadedFiles.length > 0 ? uploadedFiles : null,
      createdAt: new Date().toISOString(),
      status: 'confirmed'
    };
    
    await set(newAppointmentRef, appointmentToSave);
    
    // Also update the doctor's appointment count for capacity management
    const doctorRef = ref(database, `doctorCapacity/${appointmentData.doctorDetails.toLowerCase()}`);
    const doctorSnapshot = await get(doctorRef);
    
    if (doctorSnapshot.exists()) {
      const currentCount = doctorSnapshot.val().count || 0;
      await set(doctorRef, {
        count: currentCount + 1,
        type: appointmentData.appointmentType
      });
    } else {
      await set(doctorRef, {
        count: 1,
        type: appointmentData.appointmentType
      });
    }
  } catch (error) {
    console.error("Error saving appointment:", error);
    throw error;
  }
};

export const uploadFileToStorage = async (
  file: File,
  currentUser: User | null
): Promise<FileUpload> => {
  if (!currentUser) {
    throw new Error("Authentication required to upload files.");
  }

  const fileRef = storageRef(storage, `medical-records/${currentUser.uid}/${Date.now()}_${file.name}`);
  await uploadBytes(fileRef, file);
  const downloadURL = await getDownloadURL(fileRef);
  
  return {
    name: file.name,
    url: downloadURL,
    type: file.type
  };
};

export const cancelAppointment = async (
  userId: string,
  appointmentNo: string,
  reason: string
): Promise<boolean> => {
  try {
    // Find the appointment with the given appointment number
    const userAppointmentsRef = ref(database, `appointments/${userId}`);
    const appointmentsSnapshot = await get(userAppointmentsRef);
    
    if (!appointmentsSnapshot.exists()) {
      return false;
    }
    
    let appointmentId: string | null = null;
    let appointmentData: any = null;
    
    // Find the appointment with matching appointment number
    appointmentsSnapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val();
      if (data.appointmentNo === appointmentNo) {
        appointmentId = childSnapshot.key;
        appointmentData = data;
      }
    });
    
    if (!appointmentId || !appointmentData) {
      return false;
    }
    
    // Update the appointment status to cancelled
    const appointmentRef = ref(database, `appointments/${userId}/${appointmentId}`);
    await set(appointmentRef, {
      ...appointmentData,
      status: 'cancelled',
      cancellationReason: reason,
      cancelledAt: new Date().toISOString()
    });
    
    // Decrement the doctor's appointment count
    if (appointmentData.doctorDetails) {
      const doctorRef = ref(database, `doctorCapacity/${appointmentData.doctorDetails.toLowerCase()}`);
      const doctorSnapshot = await get(doctorRef);
      
      if (doctorSnapshot.exists()) {
        const currentCount = doctorSnapshot.val().count || 0;
        if (currentCount > 0) {
          await set(doctorRef, {
            count: currentCount - 1,
            type: appointmentData.appointmentType
          });
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    throw error;
  }
};

export const checkAppointmentAvailability = async (
  doctorName: string,
  appointmentType: string,
  capacityLimit: number
): Promise<boolean> => {
  try {
    const doctorRef = ref(database, `doctorCapacity/${doctorName.toLowerCase()}`);
    const doctorSnapshot = await get(doctorRef);
    
    if (doctorSnapshot.exists()) {
      const currentCount = doctorSnapshot.val().count || 0;
      return currentCount < capacityLimit;
    }
    
    // If no records exist, it means no appointments yet
    return true;
  } catch (error) {
    console.error("Error checking availability:", error);
    throw error;
  }
};
