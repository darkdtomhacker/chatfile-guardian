
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AppointmentData {
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

interface AppointmentTableProps {
  appointments: AppointmentData[];
  loading: boolean;
  onDelete: (userId: string, appointmentId: string) => void;
  onShowFiles: (files: {name: string, url: string, type: string}[]) => void;
  onShowCancellationDetails: (reason: string, date: string) => void;
}

const AppointmentTable: React.FC<AppointmentTableProps> = ({ 
  appointments, 
  loading, 
  onDelete, 
  onShowFiles, 
  onShowCancellationDetails 
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
    return <p>Loading appointments data...</p>;
  }

  if (appointments.length === 0) {
    return <p className="text-gray-500">No appointments recorded yet.</p>;
  }

  return (
    <Table>
      <TableCaption>Total appointments: {appointments.length}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Appointment No.</TableHead>
          <TableHead>Patient</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Symptoms</TableHead>
          <TableHead>Doctor</TableHead>
          <TableHead>Files</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {appointments.map((appointment) => (
          <TableRow key={appointment.id} className={appointment.status === 'cancelled' ? 'text-gray-400' : ''}>
            <TableCell className="font-medium">{appointment.appointmentNo}</TableCell>
            <TableCell>{appointment.fullName} ({appointment.age})</TableCell>
            <TableCell>{appointment.appointmentType}</TableCell>
            <TableCell>{appointment.symptoms}</TableCell>
            <TableCell>{appointment.doctorDetails}</TableCell>
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
              {appointment.status === 'cancelled' ? (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onShowCancellationDetails(
                    appointment.cancellationReason || 'No reason provided', 
                    appointment.cancelledAt || ''
                  )}
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(appointment.status)}`}
                >
                  Cancelled
                </Button>
              ) : (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(appointment.status || 'confirmed')}`}>
                  {appointment.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                </span>
              )}
            </TableCell>
            <TableCell>{new Date(appointment.createdAt || Date.now()).toLocaleDateString()}</TableCell>
            <TableCell>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => onDelete(appointment.userId, appointment.id)}
              >
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default AppointmentTable;
