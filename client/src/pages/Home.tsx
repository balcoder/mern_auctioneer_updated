import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Listing } from "./Listing";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css/bundle";
import ListingCard from "../assets/components/ListingCard";

export default function Home() {
  const [offerListings, setOfferListings] = useState<Listing[] | []>([]);
  const [saleListings, setSaleListings] = useState<Listing[] | []>([]);
  const [rentListings, setRentListings] = useState<Listing[] | []>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOfferListing = async () => {
      try {
        const res = await fetch(`/api/listing/get?offer=true&limit=4`);
        const data = await res.json();
        setOfferListings(data);
        fetchRentListing();
      } catch (error) {
        console.log("Problem fetching listing offers", error);
      }
    };
    const fetchSaleListing = async () => {
      try {
        const res = await fetch(`/api/listing/get?type=sale&limit=4`);
        const data = await res.json();
        setSaleListings(data);
      } catch (error) {
        console.log("Problem fetching listing sales", error);
      }
    };
    const fetchRentListing = async () => {
      try {
        const res = await fetch(`/api/listing/get?type=rent&limit=4`);
        const data = await res.json();
        setRentListings(data);
        fetchSaleListing();
      } catch (error) {
        console.log("Problem fetching listing rents", error);
      }
    };
    fetchOfferListing();
  }, []);
  return (
    <div>
      {/* Hero section */}
      <div className="flex flex-col gap-6 py-28 px-3 max-w-6xl mx-auto">
        <h1 className="text-slate-700 text-3xl sm:text-6xl font-semibold mt-9">
          Find your next <span className="text-slate-500">dream</span> <br />{" "}
          home with ease
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 font-semibold">
          Barrett Estate is the best place to find your next dream home. Our
          expert realtors are always available to support your needs.
          <br />
          We have a wide range of properties for you to choose from, whether
          you're looking to buy or rent.
        </p>
        <Link
          className="text-blue-800 text-xs sm:text-sm font-semibold hover:underline"
          to={"/search"}
        >
          Let's get started...
        </Link>
      </div>
      {/* Swiper Section */}
      <Swiper
        modules={[Navigation, Pagination]}
        pagination={{ clickable: true }}
        navigation
      >
        {offerListings &&
          offerListings.length > 0 &&
          offerListings.map((item) => (
            <SwiperSlide>
              <div
                key={item._id}
                className="h-[225px] sm:h-[550px]"
                style={{
                  background: `url(${item.imageUrls[0]}) center no-repeat`,
                  backgroundSize: "cover",
                }}
              ></div>
            </SwiperSlide>
          ))}
      </Swiper>

      {/* Listings of offer, sale and rent */}
      <div className="max-w-6xl mx-auto p-3 flex-col gap-8 my-10">
        {offerListings && offerListings.length > 0 && (
          <div className="">
            <div className="my-3">
              <h2 className="text-2xl font-semibold text-slate-600">
                Recent offers
              </h2>
              <Link
                className="text-sm text-blue-800 hover:underline"
                to={"/search?offer=true"}
              >
                Show more offers
              </Link>
            </div>
            <div className="flex gap-4 flex-wrap ">
              {offerListings.map((item) => (
                <ListingCard listing={item} key={item._id} />
              ))}
            </div>
          </div>
        )}
        {rentListings && rentListings.length > 0 && (
          <div className="">
            <div className="my-3">
              <h2 className="text-2xl font-semibold text-slate-600">
                Recent places for rent
              </h2>
              <Link
                className="text-sm text-blue-800 hover:underline"
                to={"/search?type=rent"}
              >
                Show more rentals
              </Link>
            </div>
            <div className="flex gap-4 flex-wrap ">
              {rentListings.map((item) => (
                <ListingCard listing={item} key={item._id} />
              ))}
            </div>
          </div>
        )}
        {saleListings && saleListings.length > 0 && (
          <div className="">
            <div className="my-3">
              <h2 className="text-2xl font-semibold text-slate-600">
                Recent for sale
              </h2>
              <Link
                className="text-sm text-blue-800 hover:underline"
                to={"/search?type=sale"}
              >
                Show more for sale
              </Link>
            </div>
            <div className="flex gap-4 flex-wrap ">
              {saleListings.map((item) => (
                <ListingCard listing={item} key={item._id} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
