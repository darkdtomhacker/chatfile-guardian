
import { AppointmentData, Message } from '@/types/chatTypes';
import { User } from 'firebase/auth';

export interface HandleAppointmentStageProps {
  stage: string;
  userInput: string;
  appointmentData: AppointmentData;
  setAppointmentData: React.Dispatch<React.SetStateAction<AppointmentData>>;
  currentUser: User | null;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  handleSaveAppointment: () => Promise<void>;
  resetAppointmentData: () => void;
}

export interface StageHandlerResponse {
  response: string;
  nextStage: string;
}

export interface AppointmentTypeConfig {
  type: string;
  capacity: number;
}
