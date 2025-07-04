let io;

export const setupSocket = (serverIO) => {
  io = serverIO;
  io.on('connection', (socket) => {
    console.log(`User ${socket.user?.username} connected`);

    socket.on('disconnect', () => {
      console.log(`User ${socket.user?.username} disconnected`);
    });
  });
};

export const getIO = () => io;
