import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { uploadFileToStorage } from '@/services/appointmentService';
import { Message } from '@/types/chatTypes';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import { useAppointmentFlow } from './AppointmentFlow';
import { useNavigate } from 'react-router-dom';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello! I'm the MediCare Assistant. How can I help you today?", sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<{name: string, url: string, type: string}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const resetUploadedFiles = () => {
    setUploadedFiles([]);
  };
  
  const { processAppointmentFlow } = useAppointmentFlow({
    currentUser,
    uploadedFiles,
    resetUploadedFiles,
    navigate,
    setMessages
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please log in to upload files and book appointments.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Add file message to chat
      const userMessageId = Date.now();
      setMessages(prev => [...prev, { 
        id: userMessageId, 
        text: "I've uploaded a file", 
        sender: 'user',
        file: {
          name: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.type
        }
      }]);
      
      // Simulate bot response to file upload
      setTimeout(() => {
        const botMessageId = Date.now() + 1;
        setMessages(prev => [...prev, { id: botMessageId, text: '', sender: 'bot', isTyping: true }]);
        
        setTimeout(async () => {
          try {
            // Upload file to Firebase Storage
            const fileUpload = await uploadFileToStorage(selectedFile, currentUser);
            
            // Add to uploaded files
            setUploadedFiles(prev => [...prev, fileUpload]);
            
            // File type detection for demo security vulnerability
            if (selectedFile.name.toLowerCase().endsWith('.exe') || 
                selectedFile.name.toLowerCase().endsWith('.bat') || 
                selectedFile.name.toLowerCase().endsWith('.sh')) {
              toast({
                title: "Security Alert",
                description: "You've uploaded a potentially executable file. This would be flagged in a real system.",
                variant: "destructive",
              });
              
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === botMessageId 
                    ? { 
                        ...msg, 
                        text: "⚠️ WARNING: You've uploaded a file that appears to be executable. This could be a security risk. In a real system, this would be blocked or quarantined. However, for this demonstration, I've accepted the file.", 
                        isTyping: false 
                      } 
                    : msg
                )
              );
            } else {
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === botMessageId 
                    ? { 
                        ...msg, 
                        text: `I've received your file "${selectedFile.name}" and it has been securely uploaded. Your file will be attached to your appointment record.`, 
                        isTyping: false 
                      } 
                    : msg
                )
              );
            }
          } catch (error) {
            console.error("Error uploading file:", error);
            setMessages(prev => 
              prev.map(msg => 
                msg.id === botMessageId 
                  ? { 
                      ...msg, 
                      text: "Sorry, there was an error uploading your file. Please try again or continue without the file.", 
                      isTyping: false 
                    } 
                  : msg
              )
            );
          }
        }, 1500);
      }, 500);
    }
  };

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    const userMessageId = Date.now();
    setMessages(prev => [...prev, { id: userMessageId, text: inputValue, sender: 'user' }]);
    setInputValue('');
    
    setTimeout(() => {
      const botMessageId = Date.now() + 1;
      setMessages(prev => [...prev, { id: botMessageId, text: '', sender: 'bot', isTyping: true }]);
      
      setTimeout(() => {
        const response = processAppointmentFlow(inputValue);
        setMessages(prev => 
          prev.map(msg => 
            msg.id === botMessageId 
              ? { ...msg, text: response, isTyping: false } 
              : msg
          )
        );
      }, 1500);
    }, 500);
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 flex items-center justify-center ${
          isOpen ? 'bg-gray-600' : 'bg-[#0289c7] hover:bg-[#026e9e]'
        } transition-colors duration-200`}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </Button>
      
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
    </>
  );
};

export default ChatBot;
