import React from "react";

export default function Search() {
  return (
    <div className="flex flex-col sm:flex-row">
      <div className="p-7 border-b-2 md:border-r-2 border-slate-200 md:min-h-100vh">
        <form className="flex flex-col gap-8">
          <div className="flex items-center gap-2">
            <label className="font-semibold  text-slate-700">
              Search Term:
            </label>
            <input
              className="bg-white rounded-lg p-3 w-full border border-gray-300 md:max-w-[300px]"
              type="text"
              id="searchTerm"
              placeholder="Search...."
            />
          </div>
          <div className="flex items-center flex-wrap gap-2">
            <label className="font-semibold  text-slate-700">Type:</label>
            <div className="flex gap-2">
              <input className="" type="checkbox" id="all" />
              <span>Rent&Sale</span>
            </div>
            <div className="flex gap-2">
              <input className="" type="checkbox" id="rent" />
              <span>Rent</span>
            </div>
            <div className="flex gap-2">
              <input className="" type="checkbox" id="sale" />
              <span>Sale</span>
            </div>
            <div className="flex gap-2">
              <input className="" type="checkbox" id="offer" />
              <span>Offer</span>
            </div>
          </div>
          <div className="flex items-center flex-wrap gap-2">
            <label className="font-semibold  text-slate-700">Amenities:</label>
            <div className="flex gap-2">
              <input className="" type="checkbox" id="parking" />
              <span>Parking</span>
            </div>
            <div className="flex gap-2">
              <input className="" type="checkbox" id="furnished" />
              <span>Furnished</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="font-semibold  text-slate-700">Sort:</label>
            <select
              className="border border-gray-300 rounded-lg p-3"
              name="sort_order"
              id="sort_order"
            >
              <option value="p">Price high to low</option>
              <option value="p">Price low to high</option>
              <option value="p">Latest</option>
              <option value="p">Oldest</option>
            </select>
          </div>
          <button className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95">
            Search
          </button>
        </form>
      </div>
      <div className="text-3xl font-semibold text-slate-700 border-b border-gray-300 p-3 mt-5">
        <h1>Listing Results:</h1>
      </div>
    </div>
  );
}
