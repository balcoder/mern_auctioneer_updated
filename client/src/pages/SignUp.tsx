import { Link } from "react-router-dom";

export default function SignIn() {
  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">SignUp</h1>
      <form className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="username"
          className="bg-white border border-gray-400 p-3 rounded-lg"
          id="username"
        />
        <input
          type="text"
          placeholder="email"
          className="bg-white border border-gray-400 p-3 rounded-lg"
          id="email"
        />
        <input
          type="password"
          placeholder="password"
          className="bg-white border border-gray-400 p-3 rounded-lg"
          id="password"
        />
        <button className="bg-slate-700 rounded-lg text-white p-3 uppercase hover:opacity-95 disabled:opacity-80 ">
          Sign Up
        </button>
      </form>
      <div className="flex gap-2 my-5">
        <p>Have an account?</p>
        <Link to={"/signin"} className="text-blue-700">
          Sign In
        </Link>
      </div>
    </div>
  );
}
