const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());

// Serve a simple HTML page to get location data from the phone's browser
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Share Location</title>
      </head>
      <body>
        <h1>Location Sharing</h1>
        <button onclick="shareLocation()">Share My Location</button>
        <script>
          const shareLocation = () => {
            if ('geolocation' in navigator) {
              navigator.geolocation.watchPosition((position) => {
                const { latitude, longitude } = position.coords;
                fetch('/location', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ latitude, longitude }),
                });
              });
            } else {
              alert('Geolocation is not supported by your browser.');
            }
          };
        </script>
      </body>
    </html>
  `);
});

// Endpoint to receive location data
app.post("/location", (req, res) => {
  const { latitude, longitude } = req.body;
  console.log("Location received from phone:", { latitude, longitude });
  io.emit("newLocation", { latitude, longitude }); // Broadcast to all connected clients
  res.sendStatus(200);
});

// Socket connection to broadcast updates to connected clients (your PC)
io.on("connection", (socket) => {
  console.log("PC connected to receive location updates");

  socket.on("disconnect", () => {
    console.log("PC disconnected");
  });
});

const PORT = 3000;
server.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`)
);
