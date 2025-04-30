
import { cancelAppointment } from '@/services/appointmentService';
import { User } from 'firebase/auth';
import { NavigateFunction } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Message } from '@/types/chatTypes';
import { CancellationState } from './types';

export const handleCancellationFlow = (
  userInput: string,
  cancellationState: CancellationState,
  setCancellationState: React.Dispatch<React.SetStateAction<CancellationState>>,
  resetAppointmentData: () => void,
  currentUser: User | null,
  toast: ReturnType<typeof useToast>['toast'],
  navigate: NavigateFunction
): string => {
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
