import { useState, useEffect, useCallback, useRef } from 'react';
import { getAuthenticatedWebSocketUrl, getUserFromToken } from '@/utils/auth';

// Message structure
export interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: number;
  isFromUser: boolean;
}

// Hook return type
interface WebSocketChatResult {
  messages: Message[];
  sendMessage: (content: string) => void;
  isConnected: boolean;
  error: string | null;
  isTyping: boolean;
}

/**
 * Custom hook to manage WebSocket chat connections and messages
 */
export const useWebSocketChat = (): WebSocketChatResult => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // Use refs to persist values across renders
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const maxReconnectAttempts = 5;
  const connectingRef = useRef<boolean>(false);
  const lastUserMessageTimeRef = useRef<number>(0);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Function to clear typing indicator
  const clearTypingIndicator = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    setIsTyping(false);
  }, []);

  // WebSocket connection function
  const connectWebSocket = useCallback(() => {
    // Prevent multiple connection attempts
    if (connectingRef.current) return;
    connectingRef.current = true;

    // Clear any existing connection
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    // Get WebSocket URL with auth token
    const wsUrl = getAuthenticatedWebSocketUrl();
    if (!wsUrl) {
      setError('Authentication required. Please log in again.');
      setIsConnected(false);
      connectingRef.current = false;
      return;
    }

    console.log(`Connecting to WebSocket at ${wsUrl}`);

    try {
      // Create new WebSocket connection
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      // Connection opened
      socket.addEventListener('open', () => {
        console.log('WebSocket connection established');
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
        connectingRef.current = false;
      });

      // Listen for messages
      socket.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data);

          // Handle different message types
          if (data.type === 'response') {
            const user = getUserFromToken();

            const newMessage: Message = {
              id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
              content: data.content,
              sender: 'GitBoss AI',
              timestamp: Date.now(),
              isFromUser: false,
            };

            setMessages((prevMessages) => [...prevMessages, newMessage]);
            clearTypingIndicator(); // Clear typing indicator when response received
          } else if (data.type === 'error') {
            setError(data.content);
            clearTypingIndicator(); // Clear typing on error
          } else if (data.type === 'connection_successful') {
            console.log('Authentication successful', data);
          }
        } catch (e) {
          console.error('Error parsing WebSocket message:', e);
        }
      });

      // Connection closed
      socket.addEventListener('close', (event) => {
        console.log(`WebSocket closed: ${event.code} ${event.reason}`);
        setIsConnected(false);
        socketRef.current = null;
        connectingRef.current = false;

        // Don't reconnect if closed normally or we've exceeded max attempts
        if (event.code === 1000 || reconnectAttemptsRef.current >= maxReconnectAttempts) {
          if (event.code !== 1000) {
            setError('Connection failed after multiple attempts. Please refresh the page.');
          }
          return;
        }

        // Exponential backoff for reconnection
        const delay = Math.min(1000 * (2 ** reconnectAttemptsRef.current), 30000);
        reconnectAttemptsRef.current += 1;

        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }

        setError(`Connection lost. Reconnecting in ${Math.round(delay/1000)}s...`);
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, delay);
      });

      // Connection error
      socket.addEventListener('error', (event) => {
        console.error('WebSocket error:', event);
        // Don't set error here - the close event will trigger with more info
        connectingRef.current = false;
      });
    } catch (e) {
      console.error('Error creating WebSocket:', e);
      if (e instanceof Error) {
        setError(`Connection error: ${e.message}`);
      } else {
        setError('Connection error: Unknown error');
      }
      connectingRef.current = false;
    }
  }, [clearTypingIndicator]);

  // Setup WebSocket connection
  useEffect(() => {
    // Only run on the client
    if (typeof window === 'undefined') return;

    connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        // Use 1000 (normal closure) to prevent reconnection attempts
        socketRef.current.close(1000, "Component unmounted");
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [connectWebSocket]);

  // Function to send message
  const sendMessage = useCallback((content: string) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      setError('Not connected to server');
      return;
    }

    const user = getUserFromToken();
    if (!user) {
      setError('Authentication required');
      return;
    }

    // Save timestamp of when user sent message
    lastUserMessageTimeRef.current = Date.now();

    // Create message object
    const messageObj = {
      type: 'message',
      content,
      timestamp: lastUserMessageTimeRef.current
    };

    // Send to server
    socketRef.current.send(JSON.stringify(messageObj));

    // Add to local messages
    const newMessage: Message = {
      id: `msg_${lastUserMessageTimeRef.current}_${Math.random().toString(36).substring(2, 9)}`,
      content,
      sender: user.username,
      timestamp: lastUserMessageTimeRef.current,
      isFromUser: true,
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);

    // Show typing indicator with timeout
    setIsTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Auto-hide typing indicator after 10 seconds if no response
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 10000);
  }, []);

  return { messages, sendMessage, isConnected, error, isTyping };
};