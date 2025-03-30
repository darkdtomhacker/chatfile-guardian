
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
import { useToast } from '@/hooks/use-toast';

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
  files?: {
    name: string;
    url: string;
    type: string;
  }[];
}

const AdminPanel = () => {
  const { currentUser, logout, isAdmin } = useAuth();
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!currentUser || !isAdmin) {
      navigate('/dashboard');
      return;
    }

    // Fetch all users with role patient
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

    // Fetch all appointments
    const appointmentsRef = ref(database, 'appointments');
    const unsubscribeAppointments = onValue(appointmentsRef, (snapshot) => {
      const data = snapshot.val();
      
      if (data) {
        const allAppointments: AppointmentData[] = [];
        
        // Flatten the nested structure
        Object.entries(data).forEach(([userId, userAppointments]) => {
          if (userAppointments) {
            Object.entries(userAppointments as any).forEach(([appointmentId, appointmentData]) => {
              allAppointments.push({
                id: appointmentId,
                userId,
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

    return () => {
      unsubscribeUsers();
      unsubscribeAppointments();
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

        {/* Patients Section */}
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
        
        {/* Appointments Section */}
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
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-medium">{appointment.appointmentNo}</TableCell>
                    <TableCell>{appointment.fullName} ({appointment.age})</TableCell>
                    <TableCell>{appointment.appointmentType}</TableCell>
                    <TableCell>{appointment.symptoms}</TableCell>
                    <TableCell>{appointment.doctorDetails}</TableCell>
                    <TableCell>
                      {appointment.files && appointment.files.length > 0 ? (
                        <span className="text-blue-500">{appointment.files.length} files</span>
                      ) : (
                        <span className="text-gray-400">None</span>
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
    </div>
  );
};

export default AdminPanel;
