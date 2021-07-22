const io = require("socket.io")(8900, {
  cors: {
    origin: "http://localhost:3000",
  },
});

let users = [];

const addUser = (userEmail, socketId) => {
  !users.some((user) => user.userEmail === userEmail) &&
    users.push({ userEmail, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userEmail) => {
  return users.find((user) => user.userEmail === userEmail);
};

io.on("connection", (socket) => {
  console.log("A user Connected");
  socket.on("addUser", (userEmail) => {
    addUser(userEmail, socket.id);
    io.emit("getUsers", users);
  });

  socket.on("sendMessage", ({ senderEmail, receiverEmail, message }) => {
    const user = getUser(receiverEmail);
    console.log(message);
    io.to(user?.socketId).emit("getMessage", {
      message,
    });
  });

  socket.on("disconnect", () => {
    console.log("disconnect");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});
