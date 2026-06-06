import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import listingRouter from "./routes/listing.route.js";
import cookieParser from "cookie-parser";
import path from "path";
import dns from "node:dns/promises";

dotenv.config();
console.log(process.env.NODE_ENV);

// For node v.24 on windows to connect to MongoDB
if (process.env.NODE_ENV !== "production") {
  // Explicitly force Node v24 to look up records using Cloudflare and Google
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
}

const __dirname = path.resolve();

// connect to our mongo database
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongDB!");
  })
  .catch((err) => {
    console.log(err);
  });

const app = express();

app.listen(3000, () => {
  console.log("Server is running on port 3000!");
});

app.use(express.json());
app.use(cookieParser());

// API routes
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/listing", listingRouter);

// Serve Static Files (React) Look for .png, css, etc. inside dist
app.use(express.static(path.join(__dirname, "client", "dist")));

// any url that didn't match the api routes above send index.html
app.get("*any", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});

// middleware error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
