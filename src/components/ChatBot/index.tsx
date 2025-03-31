
import React, { useState } from 'react';
import ChatButton from './components/ChatButton';
import ChatWindow from './components/ChatWindow';
import { useChat } from './hooks/useChat';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
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
