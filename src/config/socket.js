import { Server } from 'socket.io';

const configureSocket = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:3000',
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // Join chat room
        socket.on('join_chat', (chatId) => {
            socket.join(chatId);
        });

        // Handle new messages
        socket.on('new_message', (data) => {
            io.to(data.chatId).emit('message_received', data);
        });

        // Handle location updates
        socket.on('location_update', (data) => {
            io.to(data.carId).emit('location_updated', data);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });

    return io;
};

export default configureSocket; 