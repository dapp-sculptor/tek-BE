import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import path from 'path';

import { PORT } from "./config";
import { UserRouter } from "./routes";
import { connectMongoDB } from "./config/db";

// Create an instance of the Express application
const app = express();

// Connect mongo db atlas
connectMongoDB()

// Set up Cross-Origin Resource Sharing (CORS) options
app.use(cors({
  origin: ["https://tekio.tech/"],
  methods: ['GET', 'POST'],
}));

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, './public')));

// Parse incoming JSON requests using body-parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Define routes for different API endpoints
app.use("/api/users", UserRouter);

// Define a route to check if the backend server is running
app.get("/", async (req: any, res: any) => {
  res.send("Backend Server is Running now!");
});

// Start the Express server to listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

