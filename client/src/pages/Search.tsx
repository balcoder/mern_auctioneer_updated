import { useEffect, useState, startTransition } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Search() {
  const [sideBarData, setSideBarData] = useState({
    searchTerm: "",
    type: "all",
    parking: false,
    furnished: false,
    offer: false,
    sort: "created_at",
    order: "desc",
  });
  const [loading, setLoading] = useState(false);
  const [listing, setListings] = useState([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  console.log(listing);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const searchTermFromUrl = params.get("searchTerm") || "";
    const typeFromUrl = params.get("type") || "all";
    const parkingFromUrl = params.get("parking") === "true";
    const furnishedFromUrl = params.get("furnished") === "true";
    const offerFromUrl = params.get("offer") === "true";
    const sortFromUrl = params.get("sort") || "created_at";
    const orderFromUrl = params.get("order") || "desc";

    // Sync state with the URL parameters directly and wrap with startTransition
    // to mark it as low priority transition(non-blocking)
    startTransition(() => {
      setSideBarData({
        searchTerm: searchTermFromUrl,
        type: typeFromUrl,
        parking: parkingFromUrl,
        furnished: furnishedFromUrl,
        offer: offerFromUrl,
        sort: sortFromUrl,
        order: orderFromUrl,
      });
    });
    const fetchListing = async () => {
      setLoading(true);
      const searchQuery = params.toString();
      const res = await fetch(`/api/listing/get?${searchQuery}`);
      const data = await res.json();
      setListings(data);
      setLoading(false);
    };
    fetchListing();
  }, [searchParams]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { id, value } = e.target;

    if (id === "searchTerm") {
      setSideBarData({ ...sideBarData, searchTerm: value });
    }
    if (id === "all" || id === "rent" || id === "sale") {
      setSideBarData({ ...sideBarData, type: id });
    }
    if (id === "parking" || id === "furnished" || id === "offer") {
      // Explicitly grab the checked property by casting the target here
      const isChecked = (e.target as HTMLInputElement).checked;

      setSideBarData({
        ...sideBarData,
        [id]: isChecked, // Clean boolean assignment
      });
    }
    if (id === "sort_order") {
      const sort = value.split("_")[0] || "created_at";
      const order = value.split("_")[1] || "desc";
      setSideBarData({ ...sideBarData, sort, order });
    }
  };

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Sync url search terms with sidebardata
    const urlParams = new URLSearchParams();
    urlParams.set("searchTerm", sideBarData.searchTerm);
    urlParams.set("type", sideBarData.type);
    urlParams.set("parking", sideBarData.parking.toString());
    urlParams.set("furnished", sideBarData.furnished.toString());
    urlParams.set("offer", sideBarData.offer.toString());
    urlParams.set("sort", sideBarData.sort);
    urlParams.set("order", sideBarData.order);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };
  return (
    <div className="flex flex-col sm:flex-row min-w-screen">
      <div className="p-7 border-b-2 sm:border-r-2 border-slate-200 sm:min-h-screen  sm:min-w-1/3">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="flex items-center gap-2">
            <label className="font-semibold  text-slate-700">
              Search Term:
            </label>
            <input
              className="bg-white rounded-lg p-3 w-full border border-gray-300 sm:max-w-[300px]"
              type="text"
              id="searchTerm"
              placeholder="Search...."
              value={sideBarData.searchTerm}
              onChange={handleChange}
            />
          </div>
          <div className="flex items-center flex-wrap gap-2">
            <label className="font-semibold  text-slate-700">Type:</label>
            <div className="flex gap-2">
              <input
                className=""
                type="checkbox"
                id="all"
                checked={sideBarData.type === "all"}
                onChange={handleChange}
              />
              <span>Rent&Sale</span>
            </div>
            <div className="flex gap-2">
              <input
                className=""
                type="checkbox"
                id="rent"
                checked={sideBarData.type === "rent"}
                onChange={handleChange}
              />
              <span>Rent</span>
            </div>
            <div className="flex gap-2">
              <input
                className=""
                type="checkbox"
                id="sale"
                checked={sideBarData.type === "sale"}
                onChange={handleChange}
              />
              <span>Sale</span>
            </div>
            <div className="flex gap-2">
              <input
                className=""
                type="checkbox"
                id="offer"
                checked={sideBarData.offer}
                onChange={handleChange}
              />
              <span>Offer</span>
            </div>
          </div>
          <div className="flex items-center flex-wrap gap-2">
            <label className="font-semibold  text-slate-700">Amenities:</label>
            <div className="flex gap-2">
              <input
                className=""
                type="checkbox"
                id="parking"
                checked={sideBarData.parking}
                onChange={handleChange}
              />
              <span>Parking</span>
            </div>
            <div className="flex gap-2">
              <input
                className=""
                type="checkbox"
                id="furnished"
                checked={sideBarData.furnished}
                onChange={handleChange}
              />
              <span>Furnished</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="font-semibold  text-slate-700">Sort:</label>
            <select
              className="border border-gray-300 rounded-lg p-3"
              name="sort_order"
              id="sort_order"
              onChange={handleChange}
              defaultValue={"created_at_desc"}
            >
              <option value="regularPrice_desc">Price high to low</option>
              <option value="regularPrice_asc">Price low to high</option>
              <option value="createdAt_desc">Latest</option>
              <option value="createdAt_asc">Oldest</option>
            </select>
          </div>
          <button className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95">
            Search
          </button>
        </form>
      </div>
      <div className="text-3xl font-semibold text-slate-700 border-b border-gray-300 p-3 mt-5 w-full">
        <h1>Listing Results:</h1>
      </div>
    </div>
  );
}
