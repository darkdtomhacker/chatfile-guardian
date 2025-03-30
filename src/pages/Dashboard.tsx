
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { database } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ChatBot from '@/components/ChatBot';

interface AppointmentData {
  id: string;
  fullName: string;
  age: string;
  symptoms: string;
  appointmentType: string;
  doctorDetails: string;
  appointmentNo: string;
  createdAt: string;
}

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;

    const appointmentsRef = ref(database, `appointments/${currentUser.uid}`);
    const unsubscribe = onValue(appointmentsRef, (snapshot) => {
      const data = snapshot.val();
      
      if (data) {
        const appointmentsList = Object.entries(data).map(([id, appointment]) => ({
          id,
          ...appointment as any
        }));
        setAppointments(appointmentsList);
      } else {
        setAppointments([]);
      }
      
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Patient Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome, {currentUser?.displayName || 'Patient'}</p>
          </div>
          <Button onClick={handleLogout} variant="outline">Log Out</Button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Appointments</h2>
          
          {loading ? (
            <p>Loading your appointments...</p>
          ) : appointments.length > 0 ? (
            <Table>
              <TableCaption>List of your medical appointments</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Appointment No.</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-medium">{appointment.appointmentNo}</TableCell>
                    <TableCell>{appointment.appointmentType}</TableCell>
                    <TableCell>{appointment.doctorDetails}</TableCell>
                    <TableCell>{new Date(appointment.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Confirmed
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">You don't have any appointments yet.</p>
              <p className="text-sm text-gray-400">Use the chat assistant to book your first appointment.</p>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Health Records</h2>
          <p className="text-gray-500">No health records available yet. Your medical history will appear here after your first visit.</p>
        </div>
      </div>
      
      <ChatBot />
    </div>
  );
};

export default Dashboard;
