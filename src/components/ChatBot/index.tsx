
import React from 'react';
import ChatButton from './components/ChatButton';
import ChatWindow from './components/ChatWindow';
import { useChat } from './hooks/useChat';

interface ChatBotProps {
  isOpen?: boolean;
  setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  initialMessage?: string;
}

const ChatBot: React.FC<ChatBotProps> = ({ 
  isOpen: externalIsOpen, 
  setIsOpen: externalSetIsOpen,
  initialMessage
}) => {
  const [internalIsOpen, setInternalIsOpen] = React.useState(false);
  
  // Determine which state to use - external (if provided) or internal
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalSetIsOpen || setInternalIsOpen;
  
  const { 
    messages, 
    inputValue, 
    setInputValue, 
    handleFileUpload, 
    handleSubmit,
    fileInputRef,
    openFileSelector
  } = useChat(initialMessage);

  const toggleOpen = () => setIsOpen(!isOpen);

  // Auto-open chatbot if initialMessage is provided
  React.useEffect(() => {
    if (initialMessage && !isOpen) {
      setIsOpen(true);
    }
  }, [initialMessage, isOpen, setIsOpen]);

  return (
    <>
      <ChatButton isOpen={isOpen} toggleOpen={toggleOpen} />
      <ChatWindow 
        isOpen={isOpen}
        messages={messages}
        inputValue={inputValue}
        setInputValue={setInputValue}
        handleSubmit={handleSubmit}
        handleFileUpload={handleFileUpload}
        fileInputRef={fileInputRef}
        openFileSelector={openFileSelector}
      />
    </>
  );
};

export default ChatBot;
