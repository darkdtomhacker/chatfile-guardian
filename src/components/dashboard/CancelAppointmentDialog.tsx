
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";

interface AppointmentData {
  id: string;
  appointmentNo: string;
  [key: string]: any;
}

interface CancelAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: AppointmentData | null;
  reason: string;
  onReasonChange: (reason: string) => void;
  onConfirm: () => void;
}

const CancelAppointmentDialog: React.FC<CancelAppointmentDialogProps> = ({
  open,
  onOpenChange,
  appointment,
  reason,
  onReasonChange,
  onConfirm
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Appointment</DialogTitle>
          <DialogDescription>
            Please provide a reason for cancelling appointment {appointment?.appointmentNo}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            placeholder="Reason for cancellation"
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="destructive" onClick={onConfirm} disabled={!reason}>
            Confirm Cancellation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancelAppointmentDialog;
