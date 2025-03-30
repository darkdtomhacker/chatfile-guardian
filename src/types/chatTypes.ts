
export interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  isTyping?: boolean;
  file?: {
    name: string;
    size: number;
    type: string;
  };
}

export interface AppointmentData {
  fullName: string;
  age: string;
  symptoms: string;
  appointmentType: string;
  doctorDetails: string;
  appointmentNo: string;
  stage: string;
  files?: {
    name: string;
    url: string;
    type: string;
  }[];
}

export interface FileUpload {
  name: string;
  url: string;
  type: string;
}
