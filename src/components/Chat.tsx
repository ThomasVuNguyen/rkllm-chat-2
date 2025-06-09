import React, { useEffect, useState, useRef } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { sendMessageStreaming, StreamingEventHandler } from '../utils/api';
import { Message } from '../types';
export function Chat() {
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    role: 'assistant',
    content: 'Hello! How can I help you today?',
    timestamp: new Date()
  }]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Prepare a new assistant message for streaming
    const aiMessageId = (Date.now() + 1).toString();
    setMessages(prev => [
      ...prev,
      {
        id: aiMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date()
      }
    ]);

    let accumulated = '';
    const handlers: StreamingEventHandler = {
      onToken: (token) => {
        accumulated += token;
        setMessages(prev => prev.map(m => m.id === aiMessageId ? { ...m, content: accumulated } : m));
      },
      onComplete: (completeText) => {
        setMessages(prev => prev.map(m => m.id === aiMessageId ? { ...m, content: completeText } : m));
        setIsLoading(false);
      },
      onError: (error) => {
        setMessages(prev => prev.map(m => m.id === aiMessageId ? {
          ...m,
          role: 'system',
          content: 'Sorry, there was an error processing your request. Please try again or check your API configuration.',
          isError: true
        } : m));
        setIsLoading(false);
      }
    };

    sendMessageStreaming(content, messages, handlers);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages]);

  return <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto">
      <div className="flex-1 overflow-y-auto p-4">
        <MessageList messages={messages} />
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t p-4">
        <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>;
}