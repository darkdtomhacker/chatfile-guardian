
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
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { cancelAppointment } from '@/services/appointmentService';
import ChatBot from '@/components/ChatBot';
import { File, FileText, X } from 'lucide-react';

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

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentData | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [fileDialogOpen, setFileDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<{name: string, url: string, type: string}[]>([]);

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

  const handleCancelAppointment = (appointment: AppointmentData) => {
    setSelectedAppointment(appointment);
    setCancellationReason("");
    setCancelDialogOpen(true);
  };

  const confirmCancellation = async () => {
    if (!selectedAppointment || !currentUser) return;
    
    try {
      const success = await cancelAppointment(
        currentUser.uid,
        selectedAppointment.appointmentNo,
        cancellationReason
      );
      
      if (success) {
        toast({
          title: "Appointment cancelled",
          description: `Appointment ${selectedAppointment.appointmentNo} has been successfully cancelled.`,
        });
      } else {
        toast({
          title: "Cancellation failed",
          description: "We couldn't process your cancellation. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast({
        title: "Cancellation failed",
        description: "An error occurred while cancelling your appointment.",
        variant: "destructive",
      });
    } finally {
      setCancelDialogOpen(false);
    }
  };

  const showFiles = (files: {name: string, url: string, type: string}[]) => {
    setSelectedFiles(files);
    setFileDialogOpen(true);
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
                          onClick={() => handleCancelAppointment(appointment)}
                        >
                          Cancel
                        </Button>
                      )}
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
      
      {/* Cancellation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Please provide a reason for cancelling appointment {selectedAppointment?.appointmentNo}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Reason for cancellation"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmCancellation} disabled={!cancellationReason}>
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Files Dialog */}
      <Dialog open={fileDialogOpen} onOpenChange={setFileDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Uploaded Files</DialogTitle>
            <DialogDescription>
              Files attached to your appointment
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
      
      <ChatBot />
    </div>
  );
};

export default Dashboard;
