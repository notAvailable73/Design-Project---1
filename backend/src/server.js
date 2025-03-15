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

// Connect to MongoDB
connectDB();

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
