import express from "express";
import { test } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/test", (req, res) => {
  res.send("response from user.route");
});

export default router;
