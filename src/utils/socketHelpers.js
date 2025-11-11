// src/utils/socketHelpers.js
import io from 'socket.io-client';
import { API_CONFIG } from './constants';

/**
 * Initialize Socket.IO connection for real-time updates
 * @param {Function} onUpdate - Callback function when update is received
 * @returns {Object} - Socket instance
 */
export const initializeSocket = (onUpdate) => {
  const socket = io(API_CONFIG.BASE_URL);

  socket.on('update-analytics', (data) => {
    const updateTypes = [
      'owner-stats-updated',
      'property-sold',
      'owner-added',
      'owner-updated',
      'owner-deleted',
      'all-owners-stats-updated'
    ];

    if (updateTypes.includes(data.type)) {
      console.log(`🔔 Received ${data.type} event`);
      onUpdate(data);
    }
  });

  socket.on('connect', () => {
    console.log('🔌 Socket.io connected');
  });

  socket.on('disconnect', () => {
    console.log('🔌 Socket.io disconnected');
  });

  return socket;
};

/**
 * Cleanup socket connection
 * @param {Object} socket - Socket instance
 */
export const cleanupSocket = (socket) => {
  if (socket) {
    socket.disconnect();
    console.log('🔌 Socket.io disconnected');
  }
};