
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText } from 'lucide-react';

interface AppointmentData {
  id: string;
  fullName: string;
  age: string;
  symptoms: string;
  appointmentType: string;
  doctorDetails: string;
  appointmentNo: string;
  createdAt: string;
  status: 'confirmed' | 'cancelled' | 'pending';
  cancellationReason?: string;
  files?: {
    name: string;
    url: string;
    type: string;
  }[];
}

interface AppointmentsListProps {
  appointments: AppointmentData[];
  loading: boolean;
  onCancel: (appointment: AppointmentData) => void;
  onShowFiles: (files: {name: string, url: string, type: string}[]) => void;
}

const AppointmentsList: React.FC<AppointmentsListProps> = ({ 
  appointments, 
  loading, 
  onCancel, 
  onShowFiles 
}) => {
  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case 'confirmed':
        return "bg-green-100 text-green-800";
      case 'cancelled':
        return "bg-red-100 text-red-800";
      case 'pending':
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return <p>Loading your appointments...</p>;
  }
  
  if (appointments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">You don't have any appointments yet.</p>
        <p className="text-sm text-gray-400">Use the chat assistant to book your first appointment.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableCaption>List of your medical appointments</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Appointment No.</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Doctor</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Files</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {appointments.map((appointment) => (
          <TableRow key={appointment.id} className={appointment.status === 'cancelled' ? 'text-gray-400' : ''}>
            <TableCell className="font-medium">{appointment.appointmentNo}</TableCell>
            <TableCell>{appointment.appointmentType}</TableCell>
            <TableCell>{appointment.doctorDetails}</TableCell>
            <TableCell>{new Date(appointment.createdAt).toLocaleDateString()}</TableCell>
            <TableCell>
              {appointment.files && appointment.files.length > 0 ? (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onShowFiles(appointment.files || [])}
                  className="flex items-center text-blue-500 hover:text-blue-700"
                >
                  <FileText className="h-4 w-4 mr-1" />
                  {appointment.files.length} file(s)
                </Button>
              ) : (
                <span className="text-gray-400">None</span>
              )}
            </TableCell>
            <TableCell>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(appointment.status)}`}>
                {appointment.status === 'confirmed' ? 'Confirmed' : 
                 appointment.status === 'cancelled' ? 'Cancelled' : 'Pending'}
              </span>
            </TableCell>
            <TableCell>
              {appointment.status !== 'cancelled' && (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => onCancel(appointment)}
                >
                  Cancel
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default AppointmentsList;
