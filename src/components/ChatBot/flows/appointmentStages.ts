
import { HandleAppointmentStageProps } from './types/appointmentTypes';
import { 
  handleNameStage,
  handleAgeStage,
  handleDobStage,
  handleBloodGroupStage,
  handleSymptomsStage
} from './stageHandlers/personalInfoStages';
import { 
  handleRecordsStage,
  handleDoctorStage
} from './stageHandlers/doctorSelectionStage';
import { 
  handlePaymentStage,
  handleCompleteStage
} from './stageHandlers/confirmationStages';

export const handleAppointmentStage = async ({
  stage,
  userInput,
  appointmentData,
  setAppointmentData,
  currentUser,
  setMessages,
  handleSaveAppointment,
  resetAppointmentData
}: HandleAppointmentStageProps) => {
  switch(stage) {
    case 'name':
      return handleNameStage(userInput, setAppointmentData);
      
    case 'age':
      return handleAgeStage(userInput, setAppointmentData);
      
    case 'dob':
      return handleDobStage(userInput, setAppointmentData);
      
    case 'bloodGroup':
      return handleBloodGroupStage(userInput, setAppointmentData);
      
    case 'symptoms':
      return handleSymptomsStage(userInput, setAppointmentData);
      
    case 'records':
      return handleRecordsStage();
      
    case 'doctor':
      return handleDoctorStage(userInput, appointmentData, setAppointmentData, setMessages);
      
    case 'payment':
      return handlePaymentStage(appointmentData, handleSaveAppointment);
      
    case 'complete':
      return handleCompleteStage(resetAppointmentData);
      
    default:
      return {
        response: "I'm not sure I understood. Please try again.",
        nextStage: stage
      };
  }
};
