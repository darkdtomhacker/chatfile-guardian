
import { ref, push, set } from 'firebase/database';
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
      createdAt: new Date().toISOString()
    };
    
    await set(newAppointmentRef, appointmentToSave);
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
