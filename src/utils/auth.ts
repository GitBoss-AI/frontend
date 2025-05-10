/**
 * Authentication utilities for JWT storage and WebSocket connections
 */
import { getItem, setItem, removeItem } from '@/utils/storage';

const WEBSOCKET_URL = 'wss://gitboss-ai.emirbosnak.com/ws-dev';
const JWT_STRUCTURE = {
  HEADER_INDEX: 0,
  PAYLOAD_INDEX: 1,
  SIGNATURE_INDEX: 2
};

// Store JWT token in localStorage
export const storeToken = (token: string, expires: number): void => {
  setItem('auth_token', token);
  setItem('token_expiry', expires.toString());
  setItem('is_authenticated', 'true');
};

// Clear authentication data on logout
export const clearToken = (): void => {
  removeItem('auth_token');
  removeItem('token_expiry');
  setItem('is_authenticated', 'false');
};

// Get stored token
export const getToken = (): string | null => {
  const token = getItem('auth_token');
  const expiry = Number(getItem('token_expiry') || '0');

  // Check if token is expired
  const now = Math.floor(Date.now() / 1000); // Current time in seconds

  if (token && expiry && expiry > now) {
    return token;
  } else if (token) {
    clearToken();
  }

  return null;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return getToken() !== null;
};

// Get WebSocket URL with authentication token
export const getAuthenticatedWebSocketUrl = (): string | null => {
  const token = getToken();
  if (!token) {
    return null;
  }

  return `${WEBSOCKET_URL}?token=${token}`;
};

// User data extracted from a JWT token
interface TokenUser {
  id: string;
  username: string;
}

// Extract user data from the JWT token
export const getUserFromToken = (): TokenUser | null => {
  const token = getToken();
  if (!token) return null;

  try {
    // JWT tokens consist of three parts: header, payload, and signature
    const parts = token.split('.');

    // Verify the token has all three required parts
    if (parts.length !== 3) return null;

    // Base64-decode and parse the payload section (the middle part)
    const payloadBase64 = parts[JWT_STRUCTURE.PAYLOAD_INDEX];
    const decodedPayload = atob(payloadBase64);
    const payload = JSON.parse(decodedPayload);

    return {
      // 'sub' is the standard JWT claim for the subject (user ID)
      id: payload.sub,
      // Username might be included in custom claims
      username: payload.username || 'Unknown'
    };
  } catch (error) {
    console.error('Failed to parse JWT token:', error);
    return null;
  }
};