
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

interface CancellationDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  details: {reason: string, date: string} | null;
}

const CancellationDetailsDialog: React.FC<CancellationDetailsDialogProps> = ({ 
  open, 
  onOpenChange, 
  details 
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancellation Details</DialogTitle>
          <DialogDescription>
            {details?.date ? `Cancelled on ${new Date(details.date).toLocaleString()}` : ''}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <h3 className="text-sm font-medium mb-2">Reason for Cancellation:</h3>
          <div className="p-3 bg-gray-50 rounded border text-gray-700">
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
