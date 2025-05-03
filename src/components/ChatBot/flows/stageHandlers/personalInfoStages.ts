
import { AppointmentData } from '@/types/chatTypes';
import { StageHandlerResponse } from '../types/appointmentTypes';

export const handleNameStage = (
  userInput: string,
  setAppointmentData: React.Dispatch<React.SetStateAction<AppointmentData>>
): StageHandlerResponse => {
  setAppointmentData(prev => ({ ...prev, fullName: userInput }));
  return {
    response: `Thank you, ${userInput}. Could you please provide your age?`,
    nextStage: 'age'
  };
};

export const handleAgeStage = (
  userInput: string,
  setAppointmentData: React.Dispatch<React.SetStateAction<AppointmentData>>
): StageHandlerResponse => {
  if (!isNaN(Number(userInput)) || userInput.match(/\d+/)) {
    setAppointmentData(prev => ({ ...prev, age: userInput }));
    return {
      response: "Could you please provide your date of birth (DD/MM/YYYY)?",
      nextStage: 'dob'
    };
  } else {
    return {
      response: "Please enter a valid age in years.",
      nextStage: 'age'
    };
  }
};

export const handleDobStage = (
  userInput: string,
  setAppointmentData: React.Dispatch<React.SetStateAction<AppointmentData>>
): StageHandlerResponse => {
  const dateRegex = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/;
  if (dateRegex.test(userInput) || userInput.match(/\d/)) {
    setAppointmentData(prev => ({ ...prev, dob: userInput }));
    return {
      response: "What is your blood group? (A+, B+, AB+, O+, A-, B-, AB-, O- or Unknown)",
      nextStage: 'bloodGroup'
    };
  } else {
    return {
      response: "Please enter a valid date of birth in the format DD/MM/YYYY.",
      nextStage: 'dob'
    };
  }
};

export const handleBloodGroupStage = (
  userInput: string,
  setAppointmentData: React.Dispatch<React.SetStateAction<AppointmentData>>
): StageHandlerResponse => {
  const validBloodGroups = ['A+', 'B+', 'AB+', 'O+', 'A-', 'B-', 'AB-', 'O-', 'UNKNOWN'];
  const normalizedInput = userInput.toUpperCase().trim();
  
  if (validBloodGroups.includes(normalizedInput) || normalizedInput === "I DON'T KNOW" || normalizedInput === "UNKNOWN") {
    setAppointmentData(prev => ({ ...prev, bloodGroup: normalizedInput === "I DON'T KNOW" ? "Unknown" : normalizedInput }));
    return {
      response: "Could you please describe any symptoms you're experiencing?",
      nextStage: 'symptoms'
    };
  } else {
    return {
      response: "Please enter a valid blood group (A+, B+, AB+, O+, A-, B-, AB-, O-) or type 'Unknown' if you don't know.",
      nextStage: 'bloodGroup'
    };
  }
};

export const handleSymptomsStage = (
  userInput: string,
  setAppointmentData: React.Dispatch<React.SetStateAction<AppointmentData>>
): StageHandlerResponse => {
  setAppointmentData(prev => ({ ...prev, symptoms: userInput }));
  return {
    response: "Thank you for sharing this information. Do you have any previous medical records? If yes, you can upload them now using the paperclip icon.",
    nextStage: 'records'
  };
};
