
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Paperclip, AlertTriangle } from 'lucide-react';

interface ChatInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  openFileSelector: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  inputValue, 
  setInputValue, 
  handleSubmit, 
  handleFileUpload,
  openFileSelector
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
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
        </Button>
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileUpload} 
          className="hidden" 
          accept="*/*" // Deliberately accepting all files to showcase security vulnerability
        />
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
  );
};

export default ChatInput;
