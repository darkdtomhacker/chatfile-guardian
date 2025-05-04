
import { useState } from 'react';
import { Message } from '@/types/chatTypes';

interface UseMessageHandlerProps {
  processAppointmentFlow: (input: string) => Promise<string>;
}

export const useMessageHandler = ({ processAppointmentFlow }: UseMessageHandlerProps) => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello! I'm the MediCare Assistant. How can I help you today?", sender: 'bot' }
  ]);

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
    setMessages,
    handleSubmit
  };
};
