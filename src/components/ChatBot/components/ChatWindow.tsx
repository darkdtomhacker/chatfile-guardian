
import React from 'react';
import ChatMessages from '../ChatMessages';
import ChatInput from '../ChatInput';
import { Message } from '@/types/chatTypes';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface ChatWindowProps {
  isOpen: boolean;
  messages: Message[];
  inputValue: string;
  setInputValue: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  isOpen,
  messages,
  inputValue,
  setInputValue,
  handleSubmit,
  handleFileUpload,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const openFileSelector = () => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please log in to upload files and book appointments.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div 
      className={`fixed bottom-24 right-6 w-80 sm:w-96 bg-white rounded-xl shadow-xl overflow-hidden z-40 transition-all duration-300 ease-in-out ${
        isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12 pointer-events-none'
      }`}
    >
      <div className="bg-[#0289c7] text-white p-4">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h3 className="font-medium">MediCare Assistant</h3>
            <div className="flex items-center text-xs text-blue-100">
              <span className="inline-block h-2 w-2 bg-green-400 rounded-full mr-1"></span>
              <span>Typically replies instantly</span>
            </div>
          </div>
        </div>
      </div>
      
      <ChatMessages messages={messages} />
      
      <ChatInput
        inputValue={inputValue}
        setInputValue={setInputValue}
        handleSubmit={handleSubmit}
        handleFileUpload={handleFileUpload}
        openFileSelector={openFileSelector}
      />
    </div>
  );
};

export default ChatWindow;
