const socket = io();
let username = "";
const markers = {};
const map = L.map("map").setView([0, 0], 2);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap",
}).addTo(map);
const modal = document.getElementById("joinModal");
const input = document.getElementById("usernameInput");
const btn = document.getElementById("joinBtn");
const error = document.getElementById("joinError");
const setError = (msg = "") => (error.textContent = msg);

const mark = (id, coords, label) =>
  markers[id]
    ? markers[id].setLatLng(coords)
    : (markers[id] = L.marker(coords).addTo(map).bindPopup(label));
const remove = (id) =>
  markers[id] && (map.removeLayer(markers[id]), delete markers[id]);

const startGPS = () => {
  if (!navigator.geolocation) return setError("Geolocation not supported.");
  setError("Allow location access.");

  navigator.geolocation.watchPosition(
    ({ coords: { latitude, longitude } }) => {
      socket.emit("location", { latitude, longitude });
      mark("local", [latitude, longitude], `${username} (You)`);
      map.setView([latitude, longitude], 18);
      setError("");
    },
    (err) =>
      setError(
        err.code === 1
          ? "Location denied."
          : err.code === 3
            ? "GPS timeout."
            : "Location error.",
      ),
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
  );
};

const join = () => {
  const name = input.value.trim();
  if (!name) return setError("Enter a name.");
  socket.emit("join", { name });
};

btn.addEventListener("click", join);
input.addEventListener("keyup", (e) => e.key === "Enter" && join());
socket.on("joinAccepted", ({ name }) => {
  username = name;
  modal.style.display = "none";
  setError();
  startGPS();
});

socket.on("joinRejected", ({ message }) => setError(message || "Name taken."));
socket.on("activeUsers", (users) =>
  users.forEach(
    ({ id, name, latitude, longitude }) =>
      id !== socket.id &&
      latitude &&
      longitude &&
      mark(id, [latitude, longitude], name),
  ),
);

socket.on(
  "locationUpdate",
  ({ id, name, latitude, longitude }) =>
    id !== socket.id && mark(id, [latitude, longitude], name || "User"),
);

socket.on("userLeft", ({ id }) => remove(id));
