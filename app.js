const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

app.set("view engine", "ejs");
app.use(express.static("public"));

const users = new Map();

io.on("connection", (socket) => {
  socket.on("join", ({ name }) => {
    name = name?.trim();
    if (!name || [...users.values()].some((u) => u.name === name))
      return socket.emit("joinRejected", {
        message: !name ? "Enter a name." : "Name taken.",
      });

    users.set(socket.id, { name, latitude: null, longitude: null });
    socket.emit("joinAccepted", { name });
    socket.emit(
      "activeUsers",
      Array.from(users, ([id, user]) => ({ id, ...user })),
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
