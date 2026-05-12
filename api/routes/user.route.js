import express from "express";
import {
  test,
  updateUser,
  deleteUser,
  getUserListing,
} from "../controllers/user.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.get("/test", (req, res) => {
  res.send("response from user.route");
});
router.post("/update/:id", verifyToken, updateUser);
router.delete("/delete/:id", verifyToken, deleteUser);
router.get(`/listings/:id`, verifyToken, getUserListing);

export default router;
