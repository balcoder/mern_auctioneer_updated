import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from "../redux/user/userSlice";

export default function SignIn() {
  const [formData, setFormData] = useState({});
  // const [error, setError] = useState(null);
  // const [loading, setLoading] = useState(false);
  const { loading, error } = useSelector((state) => state.user);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // setLoading(true);
      dispatch(signInStart());
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      // if error middleware in index.js send json with success false
      if (data.success === false) {
        // setError(data.message);
        // setLoading(false);
        dispatch(signInFailure(data.message));
        return;
      }
      // setLoading(false);
      // setError(null);
      dispatch(signInSuccess(data));
      navigate("/");
      console.log(data);
    } catch (error) {
      // setLoading(false);
      // setError(error.message);
      dispatch(signInFailure(error.message));
    }
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Sign In</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          Sign In
        </button>
      </form>
      <div className="flex gap-2 my-5">
        <p>Dont an account?</p>
        <Link to={"/signup"} className="text-blue-700">
          Sign Up
        </Link>
      </div>
      {error && <p className="text-red-500 mt-5">{error}</p>}
    </div>
  );
}
