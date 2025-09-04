import { Server } from 'socket.io';
import { verifyJWT } from '@/lib/auth/jwt';

export function initializeWebSocket(server: any) {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ['GET', 'POST']
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const user = await verifyJWT(token);
      socket.userId = user.id;
      socket.join(`user_${user.id}`);
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected`);

    // Handle real-time health updates
    socket.on('health_update', async (data) => {
      // Process and broadcast health updates
      const processed = await processHealthUpdate(socket.userId, data);
      io.to(`user_${socket.userId}`).emit('health_processed', processed);
    });

    // Handle schedule updates
    socket.on('schedule_update', async (data) => {
      const optimized = await optimizeScheduleRealTime(socket.userId, data);
      io.to(`user_${socket.userId}`).emit('schedule_optimized', optimized);
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
    });
  });

  // Store io instance globally for use in API routes
  (global as any).io = io;
  return io;
}