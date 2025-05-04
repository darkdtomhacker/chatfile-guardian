
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useAppointmentFlow } from '../flows/useAppointmentFlow';
import { useMessageHandler } from './useMessageHandler';
import { useFileUpload } from './useFileUpload';
import { useInitialMessage } from './useInitialMessage';

export const useChat = (initialMessage?: string) => {
  const [uploadedFiles, setUploadedFiles] = useState<{name: string, url: string, type: string}[]>([]);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const resetUploadedFiles = () => {
    setUploadedFiles([]);
  };
  
  // Initialize message handler
  const { 
    messages, 
    inputValue, 
    setInputValue, 
    setMessages,
    handleSubmit 
  } = useMessageHandler({ 
    processAppointmentFlow: async (input) => {
      return await appointmentFlowHook.processAppointmentFlow(input);
    }
  });
  
  // Initialize appointment flow
  const appointmentFlowHook = useAppointmentFlow({
    currentUser,
    uploadedFiles,
    resetUploadedFiles,
    navigate,
    setMessages
  });
  
  // Initialize file upload handler
  const { 
    fileInputRef,
    openFileSelector,
    handleFileUpload
  } = useFileUpload({ 
    setMessages, 
    setUploadedFiles 
  });
  
  // Process initial message if provided
  useInitialMessage({ 
    initialMessage, 
    setMessages,
    processAppointmentFlow: appointmentFlowHook.processAppointmentFlow
  });

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
