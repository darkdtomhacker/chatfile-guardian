
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { formatDistance } from 'date-fns';

interface CancellationDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  details: {
    reason: string; 
    date: string;
    appointmentNo?: string;
    patientName?: string;
  } | null;
}

const CancellationDetailsDialog: React.FC<CancellationDetailsDialogProps> = ({ 
  open, 
  onOpenChange, 
  details 
}) => {
  let formattedDate = '';
  if (details?.date) {
    try {
      const cancelDate = new Date(details.date);
      formattedDate = `${cancelDate.toLocaleDateString()} ${cancelDate.toLocaleTimeString()}`;
      const timeAgo = formatDistance(cancelDate, new Date(), { addSuffix: true });
      formattedDate += ` (${timeAgo})`;
    } catch (e) {
      formattedDate = 'Unknown date';
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Cancellation Details</DialogTitle>
          <DialogDescription className="text-sm opacity-80">
            {details?.appointmentNo && (
              <span className="font-medium block">Appointment: {details.appointmentNo}</span>
            )}
            {details?.patientName && (
              <span className="block">Patient: {details.patientName}</span>
            )}
            {formattedDate && (
              <span className="block">Cancelled: {formattedDate}</span>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <h3 className="text-sm font-medium mb-2">Reason for Cancellation:</h3>
          <div className="p-4 bg-gray-50 rounded-md border text-gray-700 max-h-[200px] overflow-y-auto">
            {details?.reason || 'No reason provided'}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancellationDetailsDialog;
