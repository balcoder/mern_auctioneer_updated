import { useEffect, useState, type JSX } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store.ts";

export default function Header(): JSX.Element {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // add live search
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      params.set("searchTerm", searchTerm.trim());
      setSearchParams(params, { replace: true });
    }, 600); // debounce

    return () => clearTimeout(timer);
  }, [searchTerm, searchParams, setSearchParams]);

  // Handle search
  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    // keep previous searchterms while changing the search input
    const params = new URLSearchParams(searchParams);
    if (searchTerm.trim()) {
      params.set("searchTerm", searchTerm.trim());
    } else {
      params.delete("searchTerm");
    }

    navigate(`/search?${params.toString()}`);
  };

  return (
    <header className="bg-slate-200 shadow-md">
      <div className="flex justify-between items-center max-w-6xl mx-auto p-3">
        <Link to="/">
          <h1 className="font-bold text-sm sm:text-xl flex flex-wrap">
            <span className="text-slate-500">Barrett</span>
            <span className="text-slate-700">Estate</span>
          </h1>
        </Link>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-100 p-3 rounded-lg flex items-center"
        >
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent focus:outline-none w-24 sm:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button>
            <FaSearch className="text-slate-500" />
          </button>
        </form>
        <ul className="flex gap-4">
          <Link to="/">
            <li className="hidden sm:inline text-slate-700 hover:underline">
              Home
            </li>
          </Link>
          <Link to="/about">
            <li className="hidden sm:inline text-slate-700 hover:underline">
              About
            </li>
          </Link>
          <Link to="/profile">
            {currentUser ? (
              <img
                className="rounded-full w-10 h-10 object-cover"
                src={currentUser.avatar}
                alt="avatar"
                referrerPolicy="no-referrer"
              />
            ) : (
              <li className="text-slate-700 hover:underline">Sign in</li>
            )}
          </Link>
        </ul>
      </div>
    </header>
  );
}
