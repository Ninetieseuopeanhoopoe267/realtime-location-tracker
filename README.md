# Real-Time Location Tracker

A lightweight, real-time location-sharing application built with Node.js, Socket.io, and Leaflet maps. Users can join a shared session, input their names, and see each other's geographical positions move on a map instantly.

## 🚀 Features

- **Real-Time Position Updates**: High-precision tracking using the browser's Geolocation API.
- **Dynamic Mapping**: Interactive map interface powered by Leaflet.js and OpenStreetMap.
- **Unique Identification**: Name-based user sign-in that prevents duplicate usernames in active sessions.
- **Auto-Cleanup**: Instantly removes markers when users disconnect or close the tab.
- **Responsive Web Design**: Optimized CSS layout for both desktop monitors and mobile devices.

## 📂 Project Structure

```text
├── app.js              # Server-side Express & Socket.io logic
├── package.json        # Node.js project dependencies & scripts
├── public/
│   ├── css/
│   │   └── style.css   # Clean layout & overlay modal styling
│   └── js/
│       └── hello.js    # Client-side map & event socket routing
└── views/
    └── index.ejs       # Main HTML UI document
```

## 🛠️ Installation & Setup

Ensure you have [Node.js](https://nodejs.org) installed (version 14.0.0 or higher recommended).

1. Clone or download this project repository.
2. Open your terminal in the project's root folder.
3. Install the required platform dependencies:
   ```bash
   npm install
   ```

## 💻 Running the Application

### Local Machine

Start the server locally with:

```bash
npm start
```

Open your browser and navigate to: **`http://localhost:3000`**

### Testing with Multiple Mobile Devices

To see markers move across different phones or tablets:

1. Find your laptop's local network IP address:
   - **Windows (CMD):** Run `ipconfig` (look for `IPv4 Address`)
   - **Mac/Linux (Terminal):** Run `ifconfig` or `ip a`
2. Connect your testing devices to the **same Wi-Fi network** as your host computer.
3. Open your mobile browser and navigate to: **`http://YOUR_LAPTOP_IP:3000`**

## 📝 Important Note on GPS Privacy

- This app requires standard browser **Geolocation permission** to work.
- Most mobile web browsers block location access over unencrypted HTTP. When testing on a live public link, ensure you deploy using secure **HTTPS**.

## Hope you have a nice day 😊
