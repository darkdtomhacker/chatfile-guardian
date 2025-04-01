
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
import { ClipboardCopy, Check } from 'lucide-react';

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
  const [copied, setCopied] = React.useState(false);
  
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

  const copyToClipboard = () => {
    if (!details) return;
    
    const textToCopy = `
Cancellation Details:
---------------------
Appointment: ${details.appointmentNo || 'N/A'}
Patient: ${details.patientName || 'N/A'}
Date: ${formattedDate}
Reason: ${details.reason || 'No reason provided'}
    `.trim();
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Cancellation Details</DialogTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={copyToClipboard}
              title="Copy details to clipboard"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <ClipboardCopy className="h-4 w-4" />
              )}
            </Button>
          </div>
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
