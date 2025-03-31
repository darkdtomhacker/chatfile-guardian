
import React from 'react';
import { Button } from '@/components/ui/button';
import { File } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";

interface FilesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  files: {name: string, url: string, type: string}[];
}

const FilesDialog: React.FC<FilesDialogProps> = ({
  open,
  onOpenChange,
  files
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Uploaded Files</DialogTitle>
          <DialogDescription>
            Files attached to your appointment
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {files.map((file, index) => (
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
  );
};

export default FilesDialog;
