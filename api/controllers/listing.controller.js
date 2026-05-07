import Listing from "../models/listing.modle.js";

export const createListing = async (req, res, next) => {
  try {
    console.log("starting create listing");
    const listing = await Listing.create(req.body);
    console.log("stating response listing");
    return res.status(201).json(listing);
  } catch (error) {
    next(error);
  }
};
