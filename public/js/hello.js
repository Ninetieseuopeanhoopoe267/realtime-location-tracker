const socket = io();
let username = "";
const markers = {};
const $ = (id) => document.getElementById(id);
const map = L.map("map").setView([0, 0], 2);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap",
}).addTo(map);

const text = (id, value) => ($(`${id}`).textContent = value);
const mark = (id, coords, label) =>
  markers[id]
    ? markers[id].setLatLng(coords)
    : (markers[id] = L.marker(coords).addTo(map).bindPopup(label));
const remove = (id) =>
  markers[id] && (map.removeLayer(markers[id]), delete markers[id]);

const startGPS = () => {
  if (!navigator.geolocation)
    return text("joinError", "Geolocation not supported.");
  text("joinError", "Allow location access.");

  navigator.geolocation.watchPosition(
    ({ coords: { latitude, longitude } }) => {
      const coordsText = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
      socket.emit("location", { latitude, longitude });
      text("selfCoords", `Your location: ${coordsText}`);
      mark("local", [latitude, longitude], `${username} (You)`);
      map.setView([latitude, longitude], 18);
      text("joinError", "");
    },
    (err) =>
      text(
        "joinError",
        err.code === 1
          ? "Location denied."
          : err.code === 3
            ? "GPS timeout."
            : "Location error.",
      ),
    { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 },
  );
};

const join = () => {
  const name = $("usernameInput").value.trim();
  if (!name) return text("joinError", "Enter a name.");
  socket.emit("join", { name });
};

$("joinBtn").addEventListener("click", join);
$("usernameInput").addEventListener(
  "keyup",
  (e) => e.key === "Enter" && join(),
);

map.on("click", (e) => {
  const coords = `${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`;
  text("clickCoords", `Selected: ${coords}`);
  if (markers.selected) remove("selected");
  markers.selected = mark("selected", e.latlng, `Clicked: ${coords}`);
  markers.selected.openPopup();
  markers.selected.on("popupclose", () => {
    remove("selected");
    text("clickCoords", "Selected: none");
  });
});

socket.on("joinAccepted", ({ name }) => {
  username = name;
  $("joinModal").style.display = "none";
  text("joinError", "");
  startGPS();
});

socket.on("joinRejected", ({ message }) =>
  text("joinError", message || "Name taken."),
);

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
