"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useWebSocketChat } from '@/hooks/useWebSocketChat';
import { getUserFromToken } from '@/utils/auth';

interface ChatInterfaceProps {
  className?: string;
  title?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  className = '',
  title = 'GitBoss AI Assistant'
}) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { messages, sendMessage, isConnected, error } = useWebSocketChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const user = getUserFromToken();

  // Focus input when connected
  useEffect(() => {
    if (isConnected && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isConnected]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Simulate AI typing for better UX
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];

    // If the last message was from the user, show typing indicator
    if (lastMessage && lastMessage.isFromUser) {
      setIsTyping(true);

      // Hide typing indicator after a short delay or when response arrives
      const timeout = setTimeout(() => {
        setIsTyping(false);
      }, 1500);

      return () => clearTimeout(timeout);
    }
  }, [messages]);

  // Handle form submission
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    sendMessage(input.trim());
    setInput('');
  };

  // Handle retry connection
  const handleRetryConnection = () => {
    window.location.reload(); // Simple reload to reconnect
  };

  return (
    <div className={`flex h-full flex-col overflow-hidden rounded-lg bg-white shadow ${className}`}>
      {/* Header */}
      <div className="border-b p-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">{title}</h2>
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="text-xs text-gray-500">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        {error && (
          <p className="mt-1 text-xs text-red-500">{error}</p>
        )}
        {!isConnected && (
          <div className="mt-1 flex items-center justify-between">
            <span className="text-xs text-yellow-600">
              {error ? 'Connection failed' : 'Trying to reconnect...'}
            </span>
            <button
              onClick={handleRetryConnection}
              className="text-xs text-indigo-600 hover:text-indigo-800"
            >
              Retry Connection
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center">
            <p className="text-center text-sm text-gray-500">
              No messages yet. Ask GitBoss AI a question to get started.
            </p>
            <p className="mt-2 text-xs text-gray-400">
              Try asking about repository performance, code quality, or team contributions.
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isFromUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-2 ${
                    msg.isFromUser 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-xs whitespace-pre-wrap">{msg.content}</p>
                  <div className="mt-1 flex justify-between text-[10px] opacity-70">
                    <span>{msg.sender}</span>
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="rounded-lg bg-gray-100 p-2 text-gray-800">
                  <div className="flex items-center space-x-1">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-gray-400"></div>
                    <div className="h-2 w-2 animate-pulse rounded-full bg-gray-400" style={{ animationDelay: '0.2s' }}></div>
                    <div className="h-2 w-2 animate-pulse rounded-full bg-gray-400" style={{ animationDelay: '0.4s' }}></div>
                    <span className="ml-2 text-xs text-gray-500">GitBoss AI is typing...</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="border-t p-2">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder={
              isConnected
                ? 'Ask the AI assistant...'
                : 'Connecting to server...'
            }
            className="flex-1 rounded-md border-gray-300 px-2 py-1 text-sm shadow-sm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!isConnected}
          />
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-3 py-1 text-sm text-white hover:bg-indigo-700 disabled:bg-gray-400"
            disabled={!isConnected || !input.trim()}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;