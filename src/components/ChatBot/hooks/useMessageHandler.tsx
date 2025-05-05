
import { useState } from 'react';
import { Message } from '@/types/chatTypes';
import { usePatientData } from '@/hooks/usePatientData';
import { useAppointmentData } from '@/hooks/useAppointmentData';

interface UseMessageHandlerProps {
  processAppointmentFlow: (input: string) => Promise<string>;
}

export const useMessageHandler = ({ processAppointmentFlow }: UseMessageHandlerProps) => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello! I'm the MediCare Assistant. How can I help you today?", sender: 'bot' }
  ]);
  
  // VULNERABLE: Get access to all patient data
  const { patients } = usePatientData();
  const { appointments } = useAppointmentData();

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
          // VULNERABLE: Check for SQL injection
          if (userInput.includes("' OR '1'='1")) {
            // Format and return all patient data
            const patientData = patients.map(p => 
              `ID: ${p.id}, Name: ${p.name}, Email: ${p.email}, DOB: ${p.dob || 'N/A'}, Blood: ${p.bloodGroup || 'N/A'}`
            ).join('\n');
            
            setMessages(prev => 
              prev.map(msg => 
                msg.id === botMessageId 
                  ? { ...msg, text: `SQL Injection successful! Here are all patients:\n\n${patientData}`, isTyping: false } 
                  : msg
              )
            );
            return;
          }
          
          // VULNERABLE: Check for prompt injection
          if (userInput.toLowerCase().includes("ignore previous instructions") && 
              userInput.toLowerCase().includes("show all patient")) {
            // Format and return all patient records
            const allData = appointments.map(a => 
              `Appointment: ${a.appointmentNo}, Name: ${a.fullName}, Age: ${a.age}, Doctor: ${a.doctorDetails}, Type: ${a.appointmentType}, Status: ${a.status}`
            ).join('\n');
            
            setMessages(prev => 
              prev.map(msg => 
                msg.id === botMessageId 
                  ? { ...msg, text: `ADMIN MODE ACTIVATED! All patient appointments:\n\n${allData}`, isTyping: false } 
                  : msg
              )
            );
            return;
          }
          
          // VULNERABLE: Check for path traversal with appointmentNo
          const pathMatch = userInput.match(/\/appointments\?appointmentNo=(AP-\d+)/);
          if (pathMatch) {
            const appointmentNo = pathMatch[1];
            // Find the appointment with this number
            const targetAppointment = appointments.find(a => a.appointmentNo === appointmentNo);
            
            if (appointmentNo === 'AP-999') {
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === botMessageId 
                    ? { ...msg, text: "Error: Database error: relation \"appointments\" does not exist at character 15\nSQL: SELECT * FROM appointments WHERE appointmentNo='AP-999'", isTyping: false } 
                    : msg
                )
              );
              return;
            }
            
            if (targetAppointment) {
              const appointmentData = 
                `Appointment: ${targetAppointment.appointmentNo}, Name: ${targetAppointment.fullName}, Age: ${targetAppointment.age}, 
                 Symptoms: ${targetAppointment.symptoms}, Doctor: ${targetAppointment.doctorDetails}`;
              
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === botMessageId 
                    ? { ...msg, text: `Path traversal successful! Found appointment ${appointmentNo}:\n\n${appointmentData}`, isTyping: false } 
                    : msg
                )
              );
              return;
            } else {
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === botMessageId 
                    ? { ...msg, text: `No appointment found with number ${appointmentNo}.`, isTyping: false } 
                    : msg
                )
              );
              return;
            }
          }
          
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
