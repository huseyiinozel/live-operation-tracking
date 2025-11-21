import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyToken } from './utils/jwt';

let io: Server;

export const initializeSocket = (server: HTTPServer): Server => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return next(new Error('Authentication error: Invalid token'));
    }

    // Attach user info to socket
    socket.data.user = decoded;
    next();
  });

  io.on('connection', (socket: Socket) => {
    console.log(`✅ Client connected: ${socket.id}`);
    console.log(`   User: ${socket.data.user?.email} (${socket.data.user?.role})`);

    // Join operation room
    socket.on('join:operation', (operationId: string) => {
      socket.join(`operation:${operationId}`);
      console.log(`   Joined operation room: ${operationId}`);
      
      socket.emit('joined:operation', { operationId });
    });

    // Leave operation room
    socket.on('leave:operation', (operationId: string) => {
      socket.leave(`operation:${operationId}`);
      console.log(`   Left operation room: ${operationId}`);
    });

    // Join vehicle room
    socket.on('join:vehicle', (vehicleId: string) => {
      socket.join(`vehicle:${vehicleId}`);
      console.log(`   Joined vehicle room: ${vehicleId}`);
      
      socket.emit('joined:vehicle', { vehicleId });
    });

    // Leave vehicle room
    socket.on('leave:vehicle', (vehicleId: string) => {
      socket.leave(`vehicle:${vehicleId}`);
      console.log(`   Left vehicle room: ${vehicleId}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  console.log('🔌 Socket.IO initialized');
  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

