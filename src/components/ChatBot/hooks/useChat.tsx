
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { uploadFileToStorage } from '@/services/appointmentService';
import { Message } from '@/types/chatTypes';
import { useNavigate } from 'react-router-dom';
import { useAppointmentFlow } from '../flows/useAppointmentFlow';

export const useChat = (initialMessage?: string) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello! I'm the MediCare Assistant. How can I help you today?", sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<{name: string, url: string, type: string}[]>([]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
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

  // Process initial message if provided
  useEffect(() => {
    if (initialMessage) {
      const userMessageId = Date.now();
      setMessages(prev => [...prev, { id: userMessageId, text: initialMessage, sender: 'user' }]);
      
      setTimeout(() => {
        const botMessageId = Date.now() + 1;
        setMessages(prev => [...prev, { id: botMessageId, text: '', sender: 'bot', isTyping: true }]);
        
        setTimeout(async () => {
          try {
            // Get the response from the appointment flow processor
            const response = await processAppointmentFlow(initialMessage);
            
            // Update the message with the response string
            setMessages(prev => 
              prev.map(msg => 
                msg.id === botMessageId 
                  ? { ...msg, text: response, isTyping: false } 
                  : msg
              )
            );
          } catch (error) {
            console.error("Error processing message:", error);
            setMessages(prev => 
              prev.map(msg => 
                msg.id === botMessageId 
                  ? { ...msg, text: "Sorry, I encountered an error processing your request.", isTyping: false } 
                  : msg
              )
            );
          }
        }, 1500);
      }, 500);
    }
  }, [initialMessage]);

  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || isProcessingFile) return;
    
    setIsProcessingFile(true);
    const selectedFile = e.target.files[0];
    
    // Check if user is logged in
    if (!currentUser && selectedFile.size > 0) {
      toast({
        title: "Login Required",
        description: "Please log in to upload files and book appointments.",
        variant: "destructive",
      });
      navigate('/login');
      setIsProcessingFile(false);
      return;
    }
    
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
      setMessages(prev => [...prev, { 
        id: botMessageId, 
        text: '', 
        sender: 'bot', 
        isTyping: true 
      }]);
      
      setTimeout(async () => {
        try {
          let imageUrl = "";
          let responseText = "";
          let fileUpload = null;
          
          // Upload file to Firebase Storage if user is logged in
          if (currentUser) {
            try {
              fileUpload = await uploadFileToStorage(selectedFile, currentUser);
              // Add to uploaded files
              setUploadedFiles(prev => [...prev, fileUpload]);
            } catch (error) {
              console.error("Error uploading file:", error);
              responseText = "There was a problem uploading your file, but we can continue with your appointment. If needed, you can try uploading the file again later.";
            }
          }
          
          // Check if it's an image file
          if (selectedFile.type.startsWith('image/')) {
            // Create a URL for the image file
            imageUrl = URL.createObjectURL(selectedFile);
            responseText = `I've received your image "${selectedFile.name}" and displayed it in the chat.`;
          } 
          // Executable file types (for demo vulnerability)
          else if (selectedFile.name.toLowerCase().endsWith('.exe') || 
              selectedFile.name.toLowerCase().endsWith('.bat') || 
              selectedFile.name.toLowerCase().endsWith('.sh')) {
            toast({
              title: "Security Alert",
              description: "You've uploaded a potentially executable file. This would be flagged in a real system.",
              variant: "destructive",
            });
            
            responseText = "⚠️ WARNING: You've uploaded a file that appears to be executable. This could be a security risk. In a real system, this would be blocked or quarantined. However, for this demonstration, I've accepted the file.";
          } else if (!responseText) {
            responseText = `I've received your file "${selectedFile.name}" and it has been securely uploaded. Your file will be attached to your appointment record.`;
          }
          
          setMessages(prev => 
            prev.map(msg => 
              msg.id === botMessageId 
                ? { 
                    ...msg, 
                    text: responseText, 
                    isTyping: false,
                    imageUrl: imageUrl || undefined
                  } 
                : msg
            )
          );
        } catch (error) {
          console.error("Error handling file:", error);
          setMessages(prev => 
            prev.map(msg => 
              msg.id === botMessageId 
                ? { ...msg, text: "Sorry, there was an error processing your file. Please try again or continue without the file.", isTyping: false } 
                : msg
            )
          );
        } finally {
          setIsProcessingFile(false);
        }
      }, 1500);
    }, 500);
    
    // Reset file input value
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    const userMessageId = Date.now();
    setMessages(prev => [...prev, { id: userMessageId, text: inputValue, sender: 'user' }]);
    const userInput = inputValue;
    setInputValue('');
    
    setTimeout(() => {
      const botMessageId = Date.now() + 1;
      setMessages(prev => [...prev, { id: botMessageId, text: '', sender: 'bot', isTyping: true }]);
      
      setTimeout(async () => {
        try {
          // Get response from appointment flow processor
          const response = await processAppointmentFlow(userInput);
          
          // Update message with response string
          setMessages(prev => 
            prev.map(msg => 
              msg.id === botMessageId 
                ? { ...msg, text: response, isTyping: false } 
                : msg
            )
          );
        } catch (error) {
          console.error("Error processing message:", error);
          setMessages(prev => 
            prev.map(msg => 
              msg.id === botMessageId 
                ? { ...msg, text: "Sorry, I encountered an error processing your request.", isTyping: false } 
                : msg
            )
          );
        }
      }, 1500);
    }, 500);
  };

  return {
    messages,
    inputValue,
    setInputValue,
    handleFileUpload,
    handleSubmit,
    currentUser,
    fileInputRef,
    openFileSelector
  };
};
