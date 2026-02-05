export const initPostSocket = (io) => {
  io.on('connection', socket => {
    // Listen for user ID join event
    socket.on('user:join', (userId) => {
      socket.join(userId); // Join room with user ID
    });

    // ==========================================
    // NOTIFICATION EVENT - SEND TO SPECIFIC USER
    // ==========================================
    socket.on('notification:send', (data) => {
      // data = { recipientId, type, senderId, senderName, postId, content, timestamp }
      io.to(data.recipientId).emit('notification:new', data);
    });

    socket.on('disconnect', () => {
    });
  });
};