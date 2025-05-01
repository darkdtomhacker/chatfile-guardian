
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AppointmentData, Message } from '@/types/chatTypes';
import { 
  getTimeBasedGreeting,
  isGreeting,
  checkForThankYou,
  checkForSecurityThreats,
} from '@/utils/chatUtils';
import { saveAppointmentToFirebase } from '@/services/appointmentService';
import { handleCancellationFlow } from './cancellationFlow';
import { handleAppointmentStage } from './appointmentStages';
import { handleAppointmentTypeStage } from './appointmentTypeFlow';
import { AppointmentFlowProps, CancellationState } from './types';

export const useAppointmentFlow = ({ 
  currentUser, 
  uploadedFiles,
  resetUploadedFiles,
  navigate,
  setMessages
}: AppointmentFlowProps) => {
  const [appointmentData, setAppointmentData] = useState<AppointmentData>({
    fullName: '',
    age: '',
    dob: '',
    bloodGroup: '',
    symptoms: '',
    appointmentType: '',
    doctorDetails: '',
    appointmentNo: '',
    stage: 'type'
  });
  const [cancellationState, setCancellationState] = useState<CancellationState>({
    isCancelling: false,
    appointmentNo: '',
    reason: ''
  });
  const { toast } = useToast();

  const resetAppointmentData = () => {
    setAppointmentData({
      fullName: '',
      age: '',
      dob: '',
      bloodGroup: '',
      symptoms: '',
      appointmentType: '',
      doctorDetails: '',
      appointmentNo: '',
      stage: 'type'
    });
    resetUploadedFiles();
    setCancellationState({
      isCancelling: false,
      appointmentNo: '',
      reason: ''
    });
  };

  const handleSaveAppointment = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to save your appointment.",
        variant: "destructive",
      });
      navigate('/login');
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

  const processAppointmentFlow = (userInput: string): string => {
    // Check if user is logged in for any appointment-related actions
    if (!currentUser && 
        (appointmentData.stage !== 'type' || 
         userInput.toLowerCase().includes('appointment') || 
         userInput.toLowerCase().includes('cancel') ||
         userInput.toLowerCase().includes('book'))) {
      navigate('/login');
      return "You need to be logged in to book or manage appointments. I'm redirecting you to the login page.";
    }
    
    // Handle cancellation flow separately
    if (cancellationState.isCancelling) {
      return handleCancellationFlow(
        userInput, 
        cancellationState, 
        setCancellationState, 
        resetAppointmentData, 
        currentUser, 
        toast, 
        navigate
      );
    }
    
    // Check for cancellation request
    if (userInput.toLowerCase().includes('cancel') && 
        userInput.toLowerCase().includes('appointment')) {
      setCancellationState({
        ...cancellationState,
        isCancelling: true
      });
      return "I understand you want to cancel an appointment. Please provide your appointment number (starting with AP-).";
    }

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
    
    // Handle appointment type stage separately
    if (stage === 'type') {
      const { response, nextStage, requiresAuth } = handleAppointmentTypeStage(
        userInput, 
        appointmentData, 
        setAppointmentData, 
        currentUser
      );
      
      if (requiresAuth) {
        navigate('/login');
      } else {
        setAppointmentData(prev => ({ ...prev, stage: nextStage }));
      }
      
      return response;
    }
    
    // For any stage that might return a Promise, we'll handle it synchronously to satisfy TypeScript
    try {
      // Handle other appointment stages
      const handleStagePromise = Promise.resolve(handleAppointmentStage({
        stage,
        userInput,
        appointmentData,
        setAppointmentData,
        currentUser,
        setMessages,
        handleSaveAppointment,
        resetAppointmentData
      }));
      
      // Set next stage and return immediate response
      handleStagePromise.then(result => {
        setAppointmentData(prev => ({ ...prev, stage: result.nextStage }));
      }).catch(error => {
        console.error("Error in appointment stage:", error);
      });
      
      return `Processing your ${stage} information...`;
    } catch (error) {
      console.error("Error in appointment flow:", error);
      return "I'm sorry, there was an error processing your request. Please try again.";
    }
  };

  return {
    appointmentData,
    processAppointmentFlow,
    resetAppointmentData
  };
};
