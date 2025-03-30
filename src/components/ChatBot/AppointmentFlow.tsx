
import { AppointmentData } from '@/types/chatTypes';
import { 
  getTimeBasedGreeting,
  isGreeting,
  checkForThankYou,
  checkForSecurityThreats,
  recognizeAppointmentType
} from '@/utils/chatUtils';
import { saveAppointmentToFirebase, cancelAppointment, checkAppointmentAvailability } from '@/services/appointmentService';
import { User } from 'firebase/auth';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { NavigateFunction } from 'react-router-dom';
import { Message } from '@/types/chatTypes';

interface UseAppointmentFlowProps {
  currentUser: User | null;
  uploadedFiles: { name: string; url: string; type: string; }[];
  resetUploadedFiles: () => void;
  navigate: NavigateFunction;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export const useAppointmentFlow = ({ 
  currentUser, 
  uploadedFiles,
  resetUploadedFiles,
  navigate,
  setMessages
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
  const [cancellationState, setCancellationState] = useState({
    isCancelling: false,
    appointmentNo: '',
    reason: ''
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
    setCancellationState({
      isCancelling: false,
      appointmentNo: '',
      reason: ''
    });
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
      return handleCancellationFlow(userInput);
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
    let response = "";
    let nextStage = stage;
    
    switch(stage) {
      case 'type':
        const appointmentType = recognizeAppointmentType(userInput);
        if (appointmentType) {
          if (!currentUser) {
            navigate('/login');
            return "You need to be logged in to book an appointment. I'm redirecting you to the login page.";
          }
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
        // Check for appointment availability based on type
        const isDoctor = appointmentData.appointmentType === 'Doctor Appointment';
        const capacityLimit = isDoctor ? 50 : 100;
        
        // Check if slots are available for this doctor/service
        const checkAvailability = async () => {
          try {
            const isAvailable = await checkAppointmentAvailability(
              userInput, 
              appointmentData.appointmentType,
              capacityLimit
            );
            
            if (!isAvailable) {
              setAppointmentData(prev => ({ ...prev, stage: 'doctor' }));
              setMessages(prev => [
                ...prev, 
                { 
                  id: Date.now(), 
                  text: `I'm sorry, but ${userInput} is currently at full capacity (${capacityLimit} appointments). Please select another doctor or department.`, 
                  sender: 'bot' 
                }
              ]);
              return;
            }
            
            // If available, proceed with booking
            const appointmentNo = "AP-" + Math.floor(10000 + Math.random() * 90000);
            setAppointmentData(prev => ({ 
              ...prev, 
              doctorDetails: userInput,
              appointmentNo,
              stage: 'payment'
            }));
            
            setMessages(prev => [
              ...prev, 
              { 
                id: Date.now(), 
                text: `Thank you for selecting your doctor. Your preliminary appointment number is ${appointmentNo}. We accept various payment methods including insurance, credit cards, and cash at our facility.`, 
                sender: 'bot' 
              }
            ]);
          } catch (error) {
            console.error("Error checking availability:", error);
            setMessages(prev => [
              ...prev, 
              { 
                id: Date.now(), 
                text: "I'm sorry, there was an error checking appointment availability. Please try again.", 
                sender: 'bot' 
              }
            ]);
          }
        };
        
        // Start availability check
        checkAvailability();
        response = `Checking availability for ${userInput}...`;
        nextStage = stage; // Keep the stage the same until we verify availability
        break;
        
      case 'payment':
        response = `Great! Your appointment has been successfully booked.\n\nAppointment Details:\n- Type: ${appointmentData.appointmentType}\n- Patient: ${appointmentData.fullName}, Age: ${appointmentData.age}\n- Appointment #: ${appointmentData.appointmentNo}\n\nThank you for choosing MediCare. Please arrive 15 minutes before your scheduled time.`;
        nextStage = 'complete';
        
        // Save to Firebase
        handleSaveAppointment();
        break;
        
      case 'complete':
        response = "Is there anything else I can help you with? You can start a new appointment booking or ask about cancelling an existing appointment.";
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

  // Function to handle appointment cancellation flow
  const handleCancellationFlow = (userInput: string): string => {
    // First step: Get appointment number
    if (!cancellationState.appointmentNo) {
      if (userInput.toUpperCase().startsWith('AP-')) {
        setCancellationState({
          ...cancellationState,
          appointmentNo: userInput.trim()
        });
        return "Thank you. Could you please provide a reason for cancellation? This helps us improve our services.";
      } else {
        return "Please provide a valid appointment number starting with AP-";
      }
    } 
    // Second step: Get cancellation reason
    else if (!cancellationState.reason) {
      // Process cancellation
      setCancellationState({
        ...cancellationState,
        reason: userInput
      });
      
      // Attempt to cancel the appointment
      const processCancellation = async () => {
        try {
          if (!currentUser) {
            toast({
              title: "Authentication required",
              description: "Please log in to cancel your appointment.",
              variant: "destructive",
            });
            navigate('/login');
            return;
          }
          
          const success = await cancelAppointment(
            currentUser.uid,
            cancellationState.appointmentNo,
            userInput
          );
          
          if (success) {
            toast({
              title: "Appointment cancelled",
              description: `Appointment ${cancellationState.appointmentNo} has been successfully cancelled.`,
            });
          } else {
            toast({
              title: "Cancellation failed",
              description: "We couldn't find that appointment. Please check the appointment number.",
              variant: "destructive",
            });
          }
          
          resetAppointmentData();
          
        } catch (error) {
          console.error("Error cancelling appointment:", error);
          toast({
            title: "Cancellation failed",
            description: "An error occurred while cancelling your appointment.",
            variant: "destructive",
          });
        }
      };
      
      processCancellation();
      
      return `Thank you. We're processing the cancellation for appointment ${cancellationState.appointmentNo}. You will receive a confirmation shortly.`;
    }
    
    // Reset cancellation flow and return to main flow
    resetAppointmentData();
    return "Is there anything else I can help you with today?";
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

  return {
    appointmentData,
    processAppointmentFlow,
    resetAppointmentData
  };
};
