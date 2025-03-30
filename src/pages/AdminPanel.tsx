import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { database } from '@/lib/firebase';
import { ref, onValue, remove } from 'firebase/database';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { File, FileText } from 'lucide-react';
import { DoctorCapacity } from '@/types/chatTypes';

interface PatientData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

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

interface CapacityDataRecord {
  [key: string]: DoctorCapacity;
}

const AdminPanel = () => {
  const { currentUser, logout, isAdmin } = useAuth();
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [fileDialogOpen, setFileDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<{name: string, url: string, type: string}[]>([]);
  const [cancelDetailsOpen, setCancelDetailsOpen] = useState(false);
  const [selectedCancelDetails, setSelectedCancelDetails] = useState<{reason: string, date: string} | null>(null);
  const [capacityData, setCapacityData] = useState<CapacityDataRecord>({});

  useEffect(() => {
    if (!currentUser || !isAdmin) {
      navigate('/dashboard');
      return;
    }

    const usersRef = ref(database, 'users');
    const unsubscribeUsers = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      
      if (data) {
        const patientsList = Object.entries(data)
          .filter(([_, user]) => (user as any).role === 'patient')
          .map(([id, user]) => ({
            id,
            ...(user as any)
          }));
        setPatients(patientsList);
      } else {
        setPatients([]);
      }
    });

    const appointmentsRef = ref(database, 'appointments');
    const unsubscribeAppointments = onValue(appointmentsRef, (snapshot) => {
      const data = snapshot.val();
      
      if (data) {
        const allAppointments: AppointmentData[] = [];
        
        Object.entries(data).forEach(([userId, userAppointments]) => {
          if (userAppointments) {
            Object.entries(userAppointments as any).forEach(([appointmentId, appointmentData]) => {
              allAppointments.push({
                id: appointmentId,
                userId,
                status: appointmentData.status || 'confirmed',
                ...(appointmentData as any)
              });
            });
          }
        });
        
        setAppointments(allAppointments);
      } else {
        setAppointments([]);
      }
      
      setLoading(false);
    });

    const capacityRef = ref(database, 'doctorCapacity');
    const unsubscribeCapacity = onValue(capacityRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCapacityData(data as CapacityDataRecord);
      } else {
        setCapacityData({});
      }
    });

    return () => {
      unsubscribeUsers();
      unsubscribeAppointments();
      unsubscribeCapacity();
    };
  }, [currentUser, isAdmin, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const handleDeleteAppointment = async (userId: string, appointmentId: string) => {
    try {
      const appointmentRef = ref(database, `appointments/${userId}/${appointmentId}`);
      await remove(appointmentRef);
      
      toast({
        title: "Appointment deleted",
        description: "The appointment has been successfully removed.",
      });
    } catch (error) {
      console.error('Failed to delete appointment', error);
      toast({
        title: "Failed to delete",
        description: "An error occurred while deleting the appointment.",
        variant: "destructive",
      });
    }
  };

  const showFiles = (files: {name: string, url: string, type: string}[]) => {
    setSelectedFiles(files);
    setFileDialogOpen(true);
  };

  const showCancellationDetails = (reason: string, date: string) => {
    setSelectedCancelDetails({reason, date});
    setCancelDetailsOpen(true);
  };

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

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Administrator Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome, {currentUser?.displayName || 'Admin'}</p>
          </div>
          <Button onClick={handleLogout} variant="outline">Log Out</Button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Appointment Capacity</h2>
          
          {Object.keys(capacityData).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(capacityData).map(([name, data]) => {
                const isDoctor = data.type === 'Doctor Appointment';
                const limit = isDoctor ? 50 : 100;
                const percentage = (data.count / limit) * 100;
                
                return (
                  <div key={name} className="border rounded-lg p-4 shadow-sm">
                    <h3 className="font-medium text-gray-900 capitalize">{name}</h3>
                    <p className="text-sm text-gray-500">{data.type}</p>
                    <div className="mt-2 h-2 w-full bg-gray-200 rounded-full">
                      <div 
                        className={`h-full rounded-full ${
                          percentage > 90 ? 'bg-red-500' : 
                          percentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="mt-1 text-sm">
                      {data.count} / {limit} ({Math.round(percentage)}%)
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">No capacity data available yet.</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Registered Patients</h2>
          
          {loading ? (
            <p>Loading patients data...</p>
          ) : patients.length > 0 ? (
            <Table>
              <TableCaption>Total patients: {patients.length}</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Registered On</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.name}</TableCell>
                    <TableCell>{patient.email}</TableCell>
                    <TableCell>{new Date(patient.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-gray-500">No registered patients yet.</p>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">All Appointments</h2>
          
          {loading ? (
            <p>Loading appointments data...</p>
          ) : appointments.length > 0 ? (
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
                          onClick={() => showFiles(appointment.files || [])}
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
                          onClick={() => showCancellationDetails(
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
                        onClick={() => handleDeleteAppointment(appointment.userId, appointment.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-gray-500">No appointments recorded yet.</p>
          )}
        </div>
      </div>
      
      <Dialog open={fileDialogOpen} onOpenChange={setFileDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Uploaded Files</DialogTitle>
            <DialogDescription>
              Files attached to patient's appointment
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center p-3 border rounded-md">
                <div className="flex-shrink-0 mr-3">
                  {file.type.includes('image') ? (
                    <img src={file.url} alt={file.name} className="h-10 w-10 object-cover rounded" />
                  ) : (
                    <File className="h-10 w-10 text-blue-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{file.type}</p>
                </div>
                <a 
                  href={file.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-4 flex-shrink-0 bg-blue-100 text-blue-800 px-3 py-1 rounded text-xs font-medium"
                >
                  View
                </a>
              </div>
            ))}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={cancelDetailsOpen} onOpenChange={setCancelDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancellation Details</DialogTitle>
            <DialogDescription>
              {selectedCancelDetails?.date ? `Cancelled on ${new Date(selectedCancelDetails.date).toLocaleString()}` : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <h3 className="text-sm font-medium mb-2">Reason for Cancellation:</h3>
            <div className="p-3 bg-gray-50 rounded border text-gray-700">
              {selectedCancelDetails?.reason || 'No reason provided'}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;
