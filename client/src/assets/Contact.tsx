import { useState, useEffect } from "react";
import type { Listing } from "../pages/Listing";
import { Link } from "react-router-dom";
// import { landLordUser } from "./Profile";

interface ContactProps {
  listing: Listing;
}

interface Landlord {
  username: string;
  email: string;
  avatar: string;
  _id: string;
}

export default function Contact({ listing }: ContactProps) {
  const [landlord, setLandlord] = useState<Landlord | null>(null);
  const [message, setMessage] = useState("");

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    console.log(message);
  };

  useEffect(() => {
    const fetchLandLord = async () => {
      try {
        // get the realtor info from listing
        const res = await fetch(`/api/user/${listing.userRef}`);
        const data = await res.json();
        setLandlord(data);
      } catch (error) {
        // if user is not authenticated we won't see the button
        console.log(error);
      }
    };
    fetchLandLord();
  }, [listing.userRef]);
  return (
    <>
      {landlord && (
        <div className="flex flex-col gap-2">
          <p>
            Contact <span className="font-semibold">{landlord.username}</span>{" "}
            for{" "}
            <span className="font-semibold">{listing.name.toLowerCase()}</span>
          </p>
          <textarea
            name="message"
            id="message"
            rows={2}
            value={message}
            placeholder="Write your message here..."
            className="w-full border border-slate-400 p-3 bg-white"
            onChange={onChange}
          ></textarea>
          <Link
            to={`mailto:${landlord.email}?subject=${encodeURIComponent(`Regarding ${listing.name}`)}&body=${encodeURIComponent(message)}`}
            className="bg-slate-700 text-white text-center p-3 rounded-lg hover:opacity-95"
          >
            Send Message
          </Link>
        </div>
      )}
    </>
  );
}
