
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, MessageSquare, Send, Paperclip, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  isTyping?: boolean;
  file?: {
    name: string;
    size: number;
    type: string;
  };
}

interface AppointmentData {
  fullName: string;
  age: string;
  symptoms: string;
  appointmentType: string;
  doctorDetails: string;
  appointmentNo: string;
  stage: string;
}

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello! I'm the MediCare Assistant. How can I help you today?", sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [appointmentData, setAppointmentData] = useState<AppointmentData>({
    fullName: '',
    age: '',
    symptoms: '',
    appointmentType: '',
    doctorDetails: '',
    appointmentNo: '',
    stage: 'type'
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Functions from your provided code
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning!";
    if (hour < 18) return "Good afternoon!";
    return "Good evening!";
  };

  const isGreeting = (text: string) => {
    const greetings = ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'];
    return greetings.some(greeting => text.toLowerCase().includes(greeting));
  };

  const checkForThankYou = (text: string) => {
    return text.toLowerCase().includes('thank you') || text.toLowerCase().includes('thanks');
  };

  const checkForSecurityThreats = (text: string) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('hack') || lowerText.includes('exploit') || lowerText.includes('inject')) {
      return "I've detected potentially harmful content in your message. Please ensure your queries are related to healthcare services.";
    }
    return null;
  };

  const recognizeAppointmentType = (text: string) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('doctor') || lowerText.includes('appointment')) return 'Doctor Appointment';
    if (lowerText.includes('x-ray') || lowerText.includes('xray')) return 'X-ray';
    if (lowerText.includes('ecg')) return 'ECG';
    if (lowerText.includes('mri')) return 'MRI Scan';
    return null;
  };

  const processAppointmentFlow = (userInput: string) => {
    if (checkForThankYou(userInput)) {
      return "Thank you for using MediCare Assistant! Your session has been saved. Have a great day!";
    }
    
    const securityThreat = checkForSecurityThreats(userInput);
    if (securityThreat) return securityThreat;
    
    if (isGreeting(userInput)) {
      const greeting = getTimeBasedGreeting();
      return greeting + " Are you here for a doctor appointment, X-ray, ECG, or MRI scan?";
    }
    
    const { stage } = appointmentData;
    let response = "";
    let nextStage = stage;
    
    switch(stage) {
      case 'type':
        const appointmentType = recognizeAppointmentType(userInput);
        if (appointmentType) {
          response = `I'll help you book a ${appointmentType}. Could you please provide your full name?`;
          nextStage = 'name';
          setAppointmentData(prev => ({ ...prev, appointmentType }));
        } else {
          response = "Sorry, I cannot help with that. Please select one of these appointment types: Doctor Appointment, X-ray, ECG, or MRI scan.";
        }
        break;
        
      case 'name':
        response = `Thank you, ${userInput}. Could you please provide your age?`;
        nextStage = 'age';
        setAppointmentData(prev => ({ ...prev, fullName: userInput }));
        break;
        
      case 'age':
        if (!isNaN(Number(userInput)) || userInput.match(/\d+/)) {
          response = "Could you please describe any symptoms you're experiencing?";
          nextStage = 'symptoms';
          setAppointmentData(prev => ({ ...prev, age: userInput }));
        } else {
          response = "Please enter a valid age in years.";
        }
        break;
        
      case 'symptoms':
        response = "Thank you for sharing this information. Do you have any previous medical records? If yes, you can upload them now using the paperclip icon.";
        nextStage = 'records';
        setAppointmentData(prev => ({ ...prev, symptoms: userInput }));
        break;
        
      case 'records':
        response = "Thank you. Please select your preferred doctor or department for this appointment.";
        nextStage = 'doctor';
        break;
        
      case 'doctor':
        response = "Thank you for selecting your doctor. Your preliminary appointment number is AP-" + Math.floor(10000 + Math.random() * 90000) + ". We accept various payment methods including insurance, credit cards, and cash at our facility.";
        nextStage = 'payment';
        setAppointmentData(prev => ({ 
          ...prev, 
          doctorDetails: userInput,
          appointmentNo: "AP-" + Math.floor(10000 + Math.random() * 90000)
        }));
        break;
        
      case 'payment':
        response = `Great! Your appointment has been successfully booked.\n\nAppointment Details:\n- Type: ${appointmentData.appointmentType}\n- Patient: ${appointmentData.fullName}, Age: ${appointmentData.age}\n- Appointment #: ${appointmentData.appointmentNo}\n\nThank you for choosing MediCare. Please arrive 15 minutes before your scheduled time.`;
        nextStage = 'complete';
        break;
        
      case 'complete':
        response = "Is there anything else I can help you with? You can start a new appointment booking or ask other questions.";
        nextStage = 'type';
        setAppointmentData({
          fullName: '',
          age: '',
          symptoms: '',
          appointmentType: '',
          doctorDetails: '',
          appointmentNo: '',
          stage: 'type'
        });
        break;
        
      default:
        response = "I'm not sure I understood. Are you here for a doctor appointment, X-ray, ECG, or MRI scan?";
        nextStage = 'type';
    }
    
    setAppointmentData(prev => ({ ...prev, stage: nextStage }));
    return response;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        
        setTimeout(() => {
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
                      text: "⚠️ WARNING: You've uploaded a file that appears to be executable. This could be a security risk. In a real system, this would be blocked or quarantined.", 
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
                      text: `I've received your file "${selectedFile.name}". For this demo, the file is not actually processed or stored. In a real system, this file upload feature could be a security vulnerability if not properly secured against malicious files.`, 
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
    fileInputRef.current?.click();
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
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
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
        
        <div className="p-4 h-96 overflow-y-auto bg-gray-50">
          <div className="space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.sender === 'user' 
                      ? 'bg-[#0289c7] text-white rounded-tr-none' 
                      : 'bg-white shadow-sm rounded-tl-none'
                  }`}
                >
                  {message.isTyping ? (
                    <div className="flex space-x-1 items-center h-6">
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-pulse"></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm whitespace-pre-line">{message.text}</p>
                      {message.file && (
                        <div className={`mt-2 p-2 rounded-md ${message.sender === 'user' ? 'bg-[#026e9e]' : 'bg-gray-100'} flex items-center`}>
                          <Paperclip className="h-4 w-4 mr-2" />
                          <div className="overflow-hidden">
                            <p className="text-xs font-medium truncate">{message.file.name}</p>
                            <p className="text-xs opacity-70">{(message.file.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
          <div className="flex space-x-2">
            <Button 
              type="button" 
              onClick={openFileSelector}
              size="icon"
              variant="outline"
              className="h-10 w-10"
            >
              <Paperclip className="h-5 w-5 text-gray-500" />
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept="*/*" // Deliberately accepting all files to showcase security vulnerability
              />
            </Button>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button 
              type="submit" 
              className="bg-[#0289c7] hover:bg-[#026e9e] text-white"
              disabled={!inputValue.trim()}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          <div className="mt-2 text-xs text-gray-500 text-center flex items-center justify-center">
            <AlertTriangle className="h-3 w-3 mr-1 text-amber-500" />
            Educational Demo Only • Vulnerable File Upload For Demonstration
          </div>
        </form>
      </div>
    </>
  );
};

export default ChatBot;
