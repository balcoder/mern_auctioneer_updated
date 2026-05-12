import User from "../models/user.model.js";
import Listing from "../models/listing.modle.js";
import { errorHandler } from "../utils/error.js";
import bcryptjs from "bcryptjs";

export const test = (req, res) => {
  res.json({ message: "Hello from user.controller" });
};

export const updateUser = async (req, res, next) => {
  // req.user.id comes from the cookie
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, "You can only update your own account"));
  try {
    if (req.body.password) {
      req.body.password = bcryptjs.hashSync(req.body.password, 10);
    }
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          avatar: req.body.avatar,
        },
      },
      { returnDocument: "after" },
    );

    const { password, ...rest } = updatedUser._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, "You can only delete your own account"));
  try {
    await User.findByIdAndDelete(req.params.id);
    res.clearCookie("access_token");
    res.status(200).json("User has been deleted!");
  } catch (error) {
    next(error);
  }
};

export const getUserListing = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, "You can only view your own listing"));
  try {
    const listings = await Listing.find({ userRef: req.user.id });
    res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};
