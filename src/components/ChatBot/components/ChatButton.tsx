
import React from 'react';
import { Button } from '@/components/ui/button';
import { X, MessageSquare } from 'lucide-react';

interface ChatButtonProps {
  isOpen: boolean;
  toggleOpen: () => void;
}

const ChatButton: React.FC<ChatButtonProps> = ({ isOpen, toggleOpen }) => {
  return (
    <Button
      onClick={toggleOpen}
      className={`fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 flex items-center justify-center ${
        isOpen ? 'bg-gray-600' : 'bg-[#0289c7] hover:bg-[#026e9e]'
      } transition-colors duration-200`}
    >
      {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
    </Button>
  );
};

export default ChatButton;
