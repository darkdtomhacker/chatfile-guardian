
export interface AppointmentData {
  id: string;
  userId: string;
  fullName: string;
  age: string;
  symptoms: string;
  appointmentType: string;
  doctorDetails: string;
  appointmentNo: string;
  createdAt: string;
  status: 'confirmed' | 'cancelled' | 'pending';
  cancellationReason?: string;
  cancelledAt?: string;
  files?: {
    name: string;
    url: string;
    type: string;
  }[];
}

export interface FetchAppointmentsOptions {
  userId?: string | null;
  isAdmin?: boolean;
}

export interface AppointmentCallbacks {
  onSuccess: (appointments: AppointmentData[]) => void;
  onError: (error: Error) => void;
}

