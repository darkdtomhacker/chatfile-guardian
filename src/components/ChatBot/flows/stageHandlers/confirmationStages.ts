
import { AppointmentData } from '@/types/chatTypes';
import { StageHandlerResponse } from '../types/appointmentTypes';

export const handlePaymentStage = async (
  appointmentData: AppointmentData,
  handleSaveAppointment: () => Promise<void>
): Promise<StageHandlerResponse> => {
  // Save to Firebase
  await handleSaveAppointment();
  
  return {
    response: `Great! Your appointment has been successfully booked.\n\nAppointment Details:\n- Type: ${appointmentData.appointmentType}\n- Department: ${appointmentData.doctorDetails}\n- Patient: ${appointmentData.fullName}, Age: ${appointmentData.age}\n- Blood Group: ${appointmentData.bloodGroup}\n- DOB: ${appointmentData.dob}\n- Appointment #: ${appointmentData.appointmentNo}\n\nThank you for choosing MediCare. Please arrive 15 minutes before your scheduled time.`,
    nextStage: 'complete'
  };
};

export const handleCompleteStage = (
  resetAppointmentData: () => void
): StageHandlerResponse => {
  resetAppointmentData();
  return {
    response: "Is there anything else I can help you with? You can start a new appointment booking or ask about cancelling an existing appointment.",
    nextStage: 'type'
  };
};
