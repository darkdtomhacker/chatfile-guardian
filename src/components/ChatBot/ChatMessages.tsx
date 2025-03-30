
import React, { useRef, useEffect } from 'react';
import { Message } from '@/types/chatTypes';
import { Paperclip } from 'lucide-react';

interface ChatMessagesProps {
  messages: Message[];
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
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
  );
};

export default ChatMessages;
