
import React from 'react';
import ChatButton from './components/ChatButton';
import ChatWindow from './components/ChatWindow';
import { useChat } from './hooks/useChat';

interface ChatBotProps {
  isOpen?: boolean;
  setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatBot: React.FC<ChatBotProps> = ({ isOpen: externalIsOpen, setIsOpen: externalSetIsOpen }) => {
  const [internalIsOpen, setInternalIsOpen] = React.useState(false);
  
  // Determine which state to use - external (if provided) or internal
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalSetIsOpen || setInternalIsOpen;
  
  const { 
    messages, 
    inputValue, 
    setInputValue, 
    handleFileUpload, 
    handleSubmit 
  } = useChat();

  const toggleOpen = () => setIsOpen(!isOpen);

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
      />
    </>
  );
};

export default ChatBot;
