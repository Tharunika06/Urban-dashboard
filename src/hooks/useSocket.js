import { useEffect } from 'react';
import io from 'socket.io-client';
import { SOCKET_CONFIG, SOCKET_EVENTS, UI_MESSAGES } from '../utils/constants';

/**
 * Custom hook for Socket.io connection and event handling
 */
export const useSocket = (onUpdate) => {
  useEffect(() => {
    const socket = io(SOCKET_CONFIG.URL, SOCKET_CONFIG.OPTIONS);


    // Listen for updates
    socket.on(SOCKET_EVENTS.UPDATE_ANALYTICS, (data) => {
      if (
        data.type === SOCKET_EVENTS.TRANSACTION_UPDATED ||
        data.type === SOCKET_EVENTS.OWNER_STATS_UPDATED ||
        data.type === SOCKET_EVENTS.CUSTOMER_UPDATED
      ) {
        onUpdate(); // Trigger callback
      }
    });

    // Cleanup
    return () => {
      socket.disconnect();
    };
  }, [onUpdate]);
};