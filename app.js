const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.set("view engine", "ejs");
app.use(express.static("public"));

const users = new Map();

io.on("connection", (socket) => {
  socket.on("join", ({ name }) => {
    name = name?.trim();
    if (!name) return socket.emit("joinRejected", { message: "Enter a name." });
    if ([...users.values()].some((u) => u.name === name))
      return socket.emit("joinRejected", { message: "Name taken." });

    users.set(socket.id, { name, latitude: null, longitude: null });
    socket.emit("joinAccepted", { name });
    socket.emit(
      "activeUsers",
      Array.from(users.entries(), ([id, u]) => ({ id, ...u })),
    );
  });

  socket.on("location", ({ latitude, longitude }) => {
    const user = users.get(socket.id);
    if (!user) return;
    Object.assign(user, { latitude, longitude });
    io.emit("locationUpdate", {
      id: socket.id,
      name: user.name,
      latitude,
      longitude,
    });
  });

  socket.on("disconnect", () => {
    users.delete(socket.id);
    socket.broadcast.emit("userLeft", { id: socket.id });
  });
});

app.get("/", (req, res) => res.render("index"));

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => console.log(`Server on port ${PORT}`));
