import React, { useState } from 'react';
interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}
export function MessageInput({
  onSendMessage,
  isLoading
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
    }
  };
  return <form onSubmit={handleSubmit} className="flex gap-2">
      <input type="text" value={message} onChange={e => setMessage(e.target.value)} placeholder="Type your message here..." disabled={isLoading} className="flex-1 p-3 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50" />
      <button type="submit" disabled={isLoading || !message.trim()} className={`px-4 py-2 bg-primary text-primary-foreground rounded-md transition-colors ${isLoading || !message.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90'}`}>
        {isLoading ? 'Sending...' : 'Send'}
      </button>
    </form>;
}