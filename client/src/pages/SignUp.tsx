import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import OAuth from "../assets/components/OAuth";

export default function SignUp() {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      // if error middleware in index.js send json with success false
      if (data.success === false) {
        setError(data.message);
        setLoading(false);
        return;
      }
      setLoading(false);
      setError(null);
      navigate("/signin");
      console.log(data);
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">SignUp</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          onChange={handleChange}
          type="text"
          placeholder="username"
          className="bg-white border border-gray-400 p-3 rounded-lg"
          id="username"
        />
        <input
          onChange={handleChange}
          type="text"
          placeholder="email"
          className="bg-white border border-gray-400 p-3 rounded-lg"
          id="email"
        />
        <input
          onChange={handleChange}
          type="password"
          placeholder="password"
          className="bg-white border border-gray-400 p-3 rounded-lg"
          id="password"
        />
        <button
          disabled={loading}
          className="bg-slate-700 rounded-lg text-white p-3 uppercase hover:opacity-95 disabled:opacity-80 "
        >
          Sign Up
        </button>
        <OAuth />
      </form>
      <div className="flex gap-2 my-5">
        <p>Have an account?</p>
        <Link to={"/signin"} className="text-blue-700">
          Sign In
        </Link>
      </div>
      {error && <p className="text-red-500 mt-5">{error}</p>}
    </div>
  );
}
