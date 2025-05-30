
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Paperclip } from 'lucide-react';

interface ChatInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  openFileSelector: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  inputValue, 
  setInputValue, 
  handleSubmit, 
  handleFileUpload,
  fileInputRef,
  openFileSelector
}) => {
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
          accept="*/*" // Accept all file types for demo vulnerability
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
        <span className="text-amber-500 mr-1">⚠️</span>
        Educational Demo Only • Vulnerable File Upload For Security Testing
      </div>
    </form>
  );
};

export default ChatInput;
