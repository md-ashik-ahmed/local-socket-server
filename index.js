const io = require("socket.io")(
  8800,
  // console.log("Server is running on port 8800"),
  {
    cors: {
      origin: "http://localhost:5173",
    },
  }
);

let activeUsers = [];

io.on("connection", (socket) => {
  // add new User
  socket.on("new-user-add", (newUserId) => {
    // if user is not added previously
    if (!activeUsers.some((userI) => userI.userId === newUserId)) {
      activeUsers.push({ userId: newUserId, socketId: socket.id });
      console.log("New User Connected", activeUsers);
    }
    // send all active users to new user
    io.emit("get-users", activeUsers);
  });

  // send message to a specific user
  socket.on("send-message", (data) => {
    const { receiverId } = data;
    const userI = activeUsers.find((userI) => userI.userId === receiverId);
    console.log("Sending from socket to :", receiverId);
    console.log("Data: ", data);
    if (userI) {
      io.to(userI.socketId).emit("recieve-message", data);
    }
  });

  socket.on("disconnect", () => {
    // remove user from active users
    activeUsers = activeUsers.filter((userI) => userI.socketId !== socket.id);
    console.log("User Disconnected", activeUsers);
    // send all active users to all users
    io.emit("get-users", activeUsers);
  });
});
