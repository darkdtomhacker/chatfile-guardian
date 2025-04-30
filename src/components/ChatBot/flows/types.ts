
import { Message } from '@/types/chatTypes';
import { User } from 'firebase/auth';
import { NavigateFunction } from 'react-router-dom';

export interface AppointmentFlowProps {
  currentUser: User | null;
  uploadedFiles: { name: string; url: string; type: string; }[];
  resetUploadedFiles: () => void;
  navigate: NavigateFunction;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export interface CancellationState {
  isCancelling: boolean;
  appointmentNo: string;
  reason: string;
}
