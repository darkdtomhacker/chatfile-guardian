
import { AppointmentData } from '@/types/chatTypes';
import { recognizeAppointmentType } from '@/utils/chatUtils';

export const handleAppointmentTypeStage = (
  userInput: string,
  appointmentData: AppointmentData,
  setAppointmentData: React.Dispatch<React.SetStateAction<AppointmentData>>,
  currentUser: any
): { response: string; nextStage: string; requiresAuth: boolean } => {
  const appointmentType = recognizeAppointmentType(userInput);
  
  if (appointmentType) {
    if (!currentUser) {
      return { 
        response: "You need to be logged in to book an appointment. I'm redirecting you to the login page.", 
        nextStage: 'type', 
        requiresAuth: true 
      };
    }
    
    setAppointmentData(prev => ({ ...prev, appointmentType }));
    return { 
      response: `I'll help you book a ${appointmentType}. Could you please provide your full name?`, 
      nextStage: 'name', 
      requiresAuth: false 
    };
  } else {
    return { 
      response: "Sorry, I cannot help with that. Please select one of these appointment types: Doctor Appointment, X-ray, ECG, or MRI scan.", 
      nextStage: 'type', 
      requiresAuth: false 
    };
  }
};
