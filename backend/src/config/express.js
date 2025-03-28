import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// import routes
import userRoutes from "../routes/user.route.js";
import carRoutes from "../routes/car.route.js";
import rentalRoutes from "../routes/rental.route.js";
import chatRoutes from "../routes/chat.route.js";
import locationRoutes from "../routes/location.route.js";
import carListingRoutes from "../routes/carListing.route.js";

const configureExpress = () => {
  const app = express();

  // Middleware

  const corsOptions = {
    origin: ["http://localhost:5173", "http://localhost:5174"], // Allow this origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Add allowed methods
    credentials: true, // Allow credentials (if needed)
  };

  app.use(cors(corsOptions));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan("dev"));
  app.use(helmet());
  app.use(compression());

  // Serve static files
  app.use("/uploads", express.static(join(__dirname, "../../uploads")));

  // Routes
  app.use("/api/users", userRoutes);
  app.use("/api/cars", carRoutes);
  app.use("/api/rentals", rentalRoutes);
  app.use("/api/chats", chatRoutes);
  app.use("/api/locations", locationRoutes);
  app.use("/api/car-listings", carListingRoutes);

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      success: false,
      message: "Something went wrong!",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  });

  return app;
};

export default configureExpress;
