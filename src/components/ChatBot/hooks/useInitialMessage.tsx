
import { useEffect } from 'react';
import { Message } from '@/types/chatTypes';

interface UseInitialMessageProps {
  initialMessage?: string;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  processAppointmentFlow: (input: string) => Promise<string>;
}

export const useInitialMessage = ({ 
  initialMessage, 
  setMessages, 
  processAppointmentFlow 
}: UseInitialMessageProps) => {
  
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
  }, [initialMessage, processAppointmentFlow, setMessages]);
};
