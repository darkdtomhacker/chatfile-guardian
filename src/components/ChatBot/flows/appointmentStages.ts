
import { AppointmentData } from '@/types/chatTypes';
import { checkAppointmentAvailability } from '@/services/appointmentService';
import { User } from 'firebase/auth';
import { Message } from '@/types/chatTypes';

interface HandleAppointmentStageProps {
  stage: string;
  userInput: string;
  appointmentData: AppointmentData;
  setAppointmentData: React.Dispatch<React.SetStateAction<AppointmentData>>;
  currentUser: User | null;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  handleSaveAppointment: () => Promise<void>;
  resetAppointmentData: () => void;
}

export const handleAppointmentStage = async ({
  stage,
  userInput,
  appointmentData,
  setAppointmentData,
  currentUser,
  setMessages,
  handleSaveAppointment,
  resetAppointmentData
}: HandleAppointmentStageProps): Promise<{ response: string; nextStage: string }> => {
  let response = "";
  let nextStage = stage;
  
  switch(stage) {
    case 'name':
      response = `Thank you, ${userInput}. Could you please provide your age?`;
      nextStage = 'age';
      setAppointmentData(prev => ({ ...prev, fullName: userInput }));
      break;
      
    case 'age':
      if (!isNaN(Number(userInput)) || userInput.match(/\d+/)) {
        response = "Could you please provide your date of birth (DD/MM/YYYY)?";
        nextStage = 'dob';
        setAppointmentData(prev => ({ ...prev, age: userInput }));
      } else {
        response = "Please enter a valid age in years.";
      }
      break;

    case 'dob':
      // Simple date validation
      const dateRegex = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/;
      if (dateRegex.test(userInput) || userInput.match(/\d/)) {
        response = "What is your blood group? (A+, B+, AB+, O+, A-, B-, AB-, O- or Unknown)";
        nextStage = 'bloodGroup';
        setAppointmentData(prev => ({ ...prev, dob: userInput }));
      } else {
        response = "Please enter a valid date of birth in the format DD/MM/YYYY.";
      }
      break;
      
    case 'bloodGroup':
      const validBloodGroups = ['A+', 'B+', 'AB+', 'O+', 'A-', 'B-', 'AB-', 'O-', 'UNKNOWN'];
      const normalizedInput = userInput.toUpperCase().trim();
      
      if (validBloodGroups.includes(normalizedInput) || normalizedInput === "I DON'T KNOW" || normalizedInput === "UNKNOWN") {
        response = "Could you please describe any symptoms you're experiencing?";
        nextStage = 'symptoms';
        setAppointmentData(prev => ({ ...prev, bloodGroup: normalizedInput === "I DON'T KNOW" ? "Unknown" : normalizedInput }));
      } else {
        response = "Please enter a valid blood group (A+, B+, AB+, O+, A-, B-, AB-, O-) or type 'Unknown' if you don't know.";
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
      
      try {
        const isAvailable = await checkAppointmentAvailability(
          userInput, 
          appointmentData.appointmentType,
          capacityLimit
        );
        
        if (!isAvailable) {
          setMessages(prev => [
            ...prev, 
            { 
              id: Date.now(), 
              text: `I'm sorry, but ${userInput} is currently at full capacity (${capacityLimit} appointments). Please select another doctor or department.`, 
              sender: 'bot' 
            }
          ]);
          return { response: `Checking availability for ${userInput}...`, nextStage };
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
        
        return { 
          response: `Checking availability for ${userInput}...`,
          nextStage: 'payment'
        };
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
        return { response: `Error checking availability for ${userInput}...`, nextStage };
      }
      
    case 'payment':
      response = `Great! Your appointment has been successfully booked.\n\nAppointment Details:\n- Type: ${appointmentData.appointmentType}\n- Patient: ${appointmentData.fullName}, Age: ${appointmentData.age}\n- Blood Group: ${appointmentData.bloodGroup}\n- DOB: ${appointmentData.dob}\n- Appointment #: ${appointmentData.appointmentNo}\n\nThank you for choosing MediCare. Please arrive 15 minutes before your scheduled time.`;
      nextStage = 'complete';
      
      // Save to Firebase
      await handleSaveAppointment();
      break;
      
    case 'complete':
      response = "Is there anything else I can help you with? You can start a new appointment booking or ask about cancelling an existing appointment.";
      nextStage = 'type';
      resetAppointmentData();
      break;
      
    default:
      response = "I'm not sure I understood. Please try again.";
      nextStage = stage;
  }
  
  return { response, nextStage };
};
