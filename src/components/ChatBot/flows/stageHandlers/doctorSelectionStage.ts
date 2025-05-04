
import { departments, capacityLimits } from '../constants/departments';
import { AppointmentData, Message } from '@/types/chatTypes';
import { checkAppointmentAvailability } from '@/services/appointmentService';
import { StageHandlerResponse } from '../types/appointmentTypes';

export const handleRecordsStage = (): StageHandlerResponse => {
  // Format the departments list with numbers
  const departmentsList = departments.map((dept, index) => `${index + 1}. ${dept}`).join('\n');
  return {
    response: `Please select a department/specialist:\n\n${departmentsList}`,
    nextStage: 'doctor'
  };
};

export const handleDoctorStage = async (
  userInput: string,
  appointmentData: AppointmentData,
  setAppointmentData: React.Dispatch<React.SetStateAction<AppointmentData>>,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
): Promise<StageHandlerResponse> => {
  let selectedDepartment = "";
  
  // Check if user entered a number corresponding to a department
  const numberMatch = userInput.match(/^(\d+)$/);
  if (numberMatch) {
    const deptIndex = parseInt(numberMatch[1]) - 1;
    if (deptIndex >= 0 && deptIndex < departments.length) {
      selectedDepartment = departments[deptIndex];
    }
  } else {
    // Try to find department by name match
    selectedDepartment = departments.find(
      dept => dept.toLowerCase() === userInput.toLowerCase() || 
               userInput.toLowerCase().includes(dept.toLowerCase())
    ) || "";
  }
  
  if (!selectedDepartment) {
    return {
      response: "I couldn't recognize that department. Please select a number between 1-8 or type the department name.",
      nextStage: 'doctor'
    };
  }
  
  // Check for appointment availability based on type
  const isDoctor = appointmentData.appointmentType === 'Doctor Appointment';
  // Use the new capacityLimits object
  const capacityLimit = isDoctor 
    ? capacityLimits[selectedDepartment.toLowerCase()] 
    : capacityLimits[appointmentData.appointmentType];
  
  try {
    const isAvailable = await checkAppointmentAvailability(
      selectedDepartment, 
      appointmentData.appointmentType,
      capacityLimit
    );
    
    if (!isAvailable) {
      setMessages(prev => [
        ...prev, 
        { 
          id: Date.now(), 
          text: `I'm sorry, but ${selectedDepartment} is currently at full capacity (${capacityLimit} appointments). Please select another department.`, 
          sender: 'bot' 
        }
      ]);
      return { response: `${selectedDepartment} is at full capacity. Please select another department.`, nextStage: 'doctor' };
    }
    
    // If available, proceed with booking
    const appointmentNo = "AP-" + Math.floor(10000 + Math.random() * 90000);
    setAppointmentData(prev => ({ 
      ...prev, 
      doctorDetails: selectedDepartment,
      appointmentNo,
      stage: 'payment'
    }));
    
    setMessages(prev => [
      ...prev, 
      { 
        id: Date.now(), 
        text: `Thank you for selecting the ${selectedDepartment} department. Your preliminary appointment number is ${appointmentNo}. We accept various payment methods including insurance, credit cards, and cash at our facility.`, 
        sender: 'bot' 
      }
    ]);
    
    return { 
      response: `Appointment with ${selectedDepartment} confirmed. Your number is ${appointmentNo}.`,
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
    return { response: "There was an error checking availability. Please try again.", nextStage: 'doctor' };
  }
};
