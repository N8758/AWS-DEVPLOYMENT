let io;

const initializeSocket = (socketIO) => {
  io = socketIO;

  io.on("connection", (socket) => {
    console.log("✅ User Connected:", socket.id);

    socket.on("join-owner", (ownerID) => {
      socket.join(`owner-${ownerID}`);
      console.log(`Owner Joined: owner-${ownerID}`);
    });

    socket.on("disconnect", () => {
      console.log("❌ User Disconnected:", socket.id);
    });
  });
};

const getIO = () => {
  return io;
};

module.exports = {
  initializeSocket,
  getIO,
};