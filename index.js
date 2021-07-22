// const io = require("socket.io")(8900, {
//   cors: {
//     origin: "https://adsfrontend.herokuapp.com/",
//   },
// });

const express = require("express");
const socketIO = require("socket.io");

const PORT = process.env.PORT || 3010;
const INDEX = "./index.html";

const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const io = socketIO(server, {
  cors: {
    origin: "*",
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
