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
}

/**
 * Custom hook to manage WebSocket chat connections and messages
 */
export const useWebSocketChat = (): WebSocketChatResult => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Use refs to persist values across renders without triggering effects
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const maxReconnectAttempts = 5;

  // Setup WebSocket connection
  useEffect(() => {
    // Function to connect to WebSocket
    const connectWebSocket = () => {
      // Clear any existing connection
      if (socketRef.current) {
        socketRef.current.close();
      }

      // Get WebSocket URL with auth token
      const wsUrl = getAuthenticatedWebSocketUrl();
      if (!wsUrl) {
        setError('Authentication required. Please log in again.');
        setIsConnected(false);
        return;
      }

      console.log(`Connecting to WebSocket at ${wsUrl}`);

      // Create new WebSocket connection
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      // Connection opened
      socket.addEventListener('open', () => {
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful connection
        console.log('WebSocket connection established');
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
          } else if (data.type === 'error') {
            setError(data.content);
          } else if (data.type === 'connection_successful') {
            console.log('Authentication successful', data);
          }
        } catch (e) {
          console.error('Error parsing WebSocket message:', e);
        }
      });

      // Connection closed
      socket.addEventListener('close', (event) => {
        setIsConnected(false);
        console.log('WebSocket connection closed:', event.code, event.reason);

        // Don't attempt to reconnect if closed due to authentication error
        if (event.code === 1008) {
          setError('Authentication failed. Please log in again.');
        } else {
          setError('Connection lost. Attempting to reconnect...');

          // Schedule reconnection attempt with exponential backoff
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }

          // Only try to reconnect if we haven't reached max attempts
          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            const delay = Math.min(1000 * (2 ** reconnectAttemptsRef.current), 30000);
            reconnectAttemptsRef.current++;

            reconnectTimeoutRef.current = setTimeout(() => {
              console.log(`Reconnect attempt ${reconnectAttemptsRef.current} of ${maxReconnectAttempts}`);
              connectWebSocket();
            }, delay);
          } else {
            setError('Connection failed after multiple attempts. Please refresh the page.');
          }
        }
      });

      // Connection error
      socket.addEventListener('error', (event) => {
        console.error('WebSocket error:', event);
        setError('WebSocket connection error');
      });
    };

    connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

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

    // Create message object
    const messageObj = {
      type: 'message',
      content,
      timestamp: Date.now()
    };

    // Send to server
    socketRef.current.send(JSON.stringify(messageObj));

    // Add to local messages
    const newMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      content,
      sender: user.username,
      timestamp: Date.now(),
      isFromUser: true,
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
  }, []);

  return { messages, sendMessage, isConnected, error };
};