
import { AppointmentData } from '@/types/chatTypes';
import { 
  getTimeBasedGreeting,
  isGreeting,
  checkForThankYou,
  checkForSecurityThreats,
  recognizeAppointmentType
} from '@/utils/chatUtils';
import { saveAppointmentToFirebase } from '@/services/appointmentService';
import { User } from 'firebase/auth';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseAppointmentFlowProps {
  currentUser: User | null;
  uploadedFiles: { name: string; url: string; type: string; }[];
  resetUploadedFiles: () => void;
}

export const useAppointmentFlow = ({ 
  currentUser, 
  uploadedFiles,
  resetUploadedFiles
}: UseAppointmentFlowProps) => {
  const [appointmentData, setAppointmentData] = useState<AppointmentData>({
    fullName: '',
    age: '',
    symptoms: '',
    appointmentType: '',
    doctorDetails: '',
    appointmentNo: '',
    stage: 'type'
  });
  const { toast } = useToast();

  const resetAppointmentData = () => {
    setAppointmentData({
      fullName: '',
      age: '',
      symptoms: '',
      appointmentType: '',
      doctorDetails: '',
      appointmentNo: '',
      stage: 'type'
    });
    resetUploadedFiles();
  };

  const processAppointmentFlow = (userInput: string): string => {
    if (checkForThankYou(userInput)) {
      return "Thank you for using MediCare Assistant! Your session has been saved. Have a great day!";
    }
    
    const securityThreat = checkForSecurityThreats(userInput);
    if (securityThreat) return securityThreat;
    
    if (isGreeting(userInput)) {
      const greeting = getTimeBasedGreeting();
      return greeting + " Are you here for a doctor appointment, X-ray, ECG, or MRI scan?";
    }
    
    const { stage } = appointmentData;
    let response = "";
    let nextStage = stage;
    
    switch(stage) {
      case 'type':
        const appointmentType = recognizeAppointmentType(userInput);
        if (appointmentType) {
          response = `I'll help you book a ${appointmentType}. Could you please provide your full name?`;
          nextStage = 'name';
          setAppointmentData(prev => ({ ...prev, appointmentType }));
        } else {
          response = "Sorry, I cannot help with that. Please select one of these appointment types: Doctor Appointment, X-ray, ECG, or MRI scan.";
        }
        break;
        
      case 'name':
        response = `Thank you, ${userInput}. Could you please provide your age?`;
        nextStage = 'age';
        setAppointmentData(prev => ({ ...prev, fullName: userInput }));
        break;
        
      case 'age':
        if (!isNaN(Number(userInput)) || userInput.match(/\d+/)) {
          response = "Could you please describe any symptoms you're experiencing?";
          nextStage = 'symptoms';
          setAppointmentData(prev => ({ ...prev, age: userInput }));
        } else {
          response = "Please enter a valid age in years.";
        }
        break;
        
      case 'symptoms':
        response = "Thank you for sharing this information. Do you have any previous medical records? If yes, you can upload them now using the paperclip icon.";
        nextStage = 'records';
        setAppointmentData(prev => ({ ...prev, symptoms: userInput }));
        break;
        
      case 'records':
        response = "Thank you. Please select your preferred doctor or department for this appointment.";
        nextStage = 'doctor';
        break;
        
      case 'doctor':
        const appointmentNo = "AP-" + Math.floor(10000 + Math.random() * 90000);
        response = `Thank you for selecting your doctor. Your preliminary appointment number is ${appointmentNo}. We accept various payment methods including insurance, credit cards, and cash at our facility.`;
        nextStage = 'payment';
        setAppointmentData(prev => ({ 
          ...prev, 
          doctorDetails: userInput,
          appointmentNo
        }));
        break;
        
      case 'payment':
        response = `Great! Your appointment has been successfully booked.\n\nAppointment Details:\n- Type: ${appointmentData.appointmentType}\n- Patient: ${appointmentData.fullName}, Age: ${appointmentData.age}\n- Appointment #: ${appointmentData.appointmentNo}\n\nThank you for choosing MediCare. Please arrive 15 minutes before your scheduled time.`;
        nextStage = 'complete';
        
        // Save to Firebase
        handleSaveAppointment();
        break;
        
      case 'complete':
        response = "Is there anything else I can help you with? You can start a new appointment booking or ask other questions.";
        nextStage = 'type';
        resetAppointmentData();
        break;
        
      default:
        response = "I'm not sure I understood. Are you here for a doctor appointment, X-ray, ECG, or MRI scan?";
        nextStage = 'type';
    }
    
    setAppointmentData(prev => ({ ...prev, stage: nextStage }));
    return response;
  };

  const handleSaveAppointment = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to save your appointment.",
        variant: "destructive",
      });
      return;
    }

    try {
      await saveAppointmentToFirebase(currentUser, appointmentData, uploadedFiles);
      
      toast({
        title: "Appointment saved",
        description: "Your appointment has been successfully recorded.",
      });
    } catch (error) {
      console.error("Error saving appointment:", error);
      toast({
        title: "Failed to save appointment",
        description: "An error occurred while saving your appointment.",
        variant: "destructive",
      });
    }
  };

  return {
    appointmentData,
    processAppointmentFlow,
    resetAppointmentData
  };
};
