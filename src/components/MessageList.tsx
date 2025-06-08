import React from 'react';
import { Message } from '../types';
interface MessageListProps {
  messages: Message[];
}
export function MessageList({
  messages
}: MessageListProps) {
  return <div className="space-y-4">
      {messages.map(message => <div key={message.id} className={`p-4 rounded-lg max-w-[85%] ${message.role === 'user' ? 'ml-auto bg-primary text-primary-foreground' : message.role === 'assistant' ? 'bg-secondary text-secondary-foreground' : 'bg-destructive/10 text-destructive border border-destructive/20'}`}>
          <p>{message.content}</p>
          <div className="text-xs opacity-70 mt-1 text-right">
            {message.timestamp.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })}
          </div>
        </div>)}
    </div>;
}