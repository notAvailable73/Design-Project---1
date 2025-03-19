import dotenv from "dotenv";
import http from "http";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import connectDB from "./config/database.js";
import configureExpress from "./config/express.js";
import configureSocket from "./config/socket.js";

// Load environment variables
dotenv.config({
  path: join(dirname(fileURLToPath(import.meta.url)), "../.env"),
});

// Create Express app
const app = configureExpress();

// Create HTTP server
const httpServer = http.createServer(app);

// Configure Socket.IO
const io = configureSocket(httpServer);

// Attach Socket.IO to the app
app.set("io", io);

// Connect to MongoDB
connectDB();

// Serve the HTML page for location sharing
app.get("/location-share", (req, res) => {
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
              navigator.geolocation.watchPosition(
                (position) => {
                  const { latitude, longitude } = position.coords;
                  console.log("Sending location:", { latitude, longitude });
                  fetch('/location', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ latitude, longitude }),
                  })
                    .then((response) => {
                      if (response.ok) {
                        console.log("Location sent successfully");
                      } else {
                        console.error("Failed to send location");
                      }
                    })
                    .catch((error) => {
                      console.error("Error sending location:", error);
                    });
                },
                (error) => {
                  console.error("Error getting location:", error);
                },
                { enableHighAccuracy: true }
              );
            } else {
              alert('Geolocation is not supported by your browser.');
            }
          };
        </script>
      </body>
    </html>
  `);
});

// Handle location updates from the phone
app.post("/location", (req, res) => {
  const { latitude, longitude } = req.body;
  console.log("Location received from phone:", { latitude, longitude });

  // Broadcast the location to all connected clients
  const io = app.get("io");
  io.emit("newLocation", { latitude, longitude }); // Ensure this line is executed
  console.log("Broadcasted location to clients");

  res.sendStatus(200);
});

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log("New client connected");

  // Handle incoming messages from the client
  socket.on("location", (message) => {
    console.log("Received location:", message);
  });

  // Handle client disconnection
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
