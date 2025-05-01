
import React from 'react';
import { Message } from '@/types/chatTypes';
import ChatMessages from '../ChatMessages';
import ChatInput from '../ChatInput';

interface ChatWindowProps {
  isOpen: boolean;
  messages: Message[];
  inputValue: string;
  setInputValue: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  openFileSelector: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ 
  isOpen, 
  messages, 
  inputValue, 
  setInputValue, 
  handleSubmit, 
  handleFileUpload,
  fileInputRef,
  openFileSelector
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed bottom-20 right-5 w-80 sm:w-96 md:w-[450px] h-[500px] bg-white rounded-lg shadow-xl flex flex-col z-50 overflow-hidden">
      <div className="bg-[#0289c7] text-white p-3 flex justify-between items-center">
        <h3 className="font-semibold">MediCare Assistant</h3>
        <div className="flex items-center text-xs">
          <span className="inline-block h-2 w-2 bg-green-400 rounded-full mr-1"></span>
          Online
        </div>
      </div>
      
      <ChatMessages messages={messages} />
      
      <ChatInput 
        inputValue={inputValue} 
        setInputValue={setInputValue} 
        handleSubmit={handleSubmit} 
        handleFileUpload={handleFileUpload}
        fileInputRef={fileInputRef}
        openFileSelector={openFileSelector}
      />
    </div>
  );
};

export default ChatWindow;
