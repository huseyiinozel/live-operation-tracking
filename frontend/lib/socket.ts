import { io, Socket } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export const initializeSocket = (token: string): Socket => {
  if (socket && socket.connected) {
    return socket;
  }

  socket = io(API_URL, {
    auth: {
      token,
    },
    autoConnect: true,
  });

  socket.on('connect', () => {
    console.log('✅ WebSocket connected');
  });

  socket.on('disconnect', () => {
    console.log('❌ WebSocket disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('WebSocket connection error:', error.message);
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinOperation = (operationId: string) => {
  if (socket) {
    socket.emit('join:operation', operationId);
  }
};

export const leaveOperation = (operationId: string) => {
  if (socket) {
    socket.emit('leave:operation', operationId);
  }
};

export const joinVehicle = (vehicleId: string) => {
  if (socket) {
    socket.emit('join:vehicle', vehicleId);
  }
};

export const leaveVehicle = (vehicleId: string) => {
  if (socket) {
    socket.emit('leave:vehicle', vehicleId);
  }
};

