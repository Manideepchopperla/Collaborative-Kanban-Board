import Message from '../models/Message.js';
let io;

const rooms = {};

export const setupSocket = (serverIO) => {
  io = serverIO;
  io.on('connection', (socket) => {
    console.log(`User ${socket.user?.username} connected with id ${socket.id}`);

    socket.on('join_room', ({ roomId }) => {
        socket.join(roomId);
        console.log(`User ${socket.user.username} joined room ${roomId}`);

        // Add user to our room tracking object
        if (!rooms[roomId]) {
            rooms[roomId] = [];
        }

        if (!rooms[roomId].some(member => member.id === socket.id)) {
            rooms[roomId].push({ id: socket.id, username: socket.user.username });
        }
        
        socket.roomId = roomId;

        // Broadcast the updated member list to everyone in the room
        io.to(roomId).emit('update_members', rooms[roomId]);
    });

    socket.on('leave_room', ({ roomId }) => {
        socket.leave(roomId);
        console.log(`User ${socket.user.username} left room ${roomId}`);
        if (rooms[roomId]) {
            rooms[roomId] = rooms[roomId].filter(member => member.id !== socket.id);
            io.to(roomId).emit('update_members', rooms[roomId]);
        }
    });

    socket.on('send_message', async ({ roomId, content }) => {
      if (!roomId || !content) return;
      try {
        const message = new Message({
          boardId: roomId,
          userId: socket.user.id,
          username: socket.user.username,
          content: content,
        });
        await message.save();
        io.to(roomId).emit('new_message', message.toObject());
      } catch (error) {
        console.error('Socket send_message error:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.user?.username} disconnected`);
      // When a user disconnects, remove them from any room they were in
      const { roomId } = socket;
      if (roomId && rooms[roomId]) {
          rooms[roomId] = rooms[roomId].filter(member => member.id !== socket.id);
          // Broadcast the updated member list
          io.to(roomId).emit('update_members', rooms[roomId]);
      }
    });
    
  });
};

export const getIO = () => io;