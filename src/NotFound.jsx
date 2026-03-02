import { Link } from "react-router-dom";
import Whiteheart from "./assets/whiteheart.png";
import Logo from "./assets/logo.png";

export default function NotFound() {
  return (
    <div
      className="flex flex-col items-center justify-center w-full min-h-[100svh] px-8 text-center font-display"
      style={{
        backgroundColor: "#ffb6d9",
        backgroundImage: `url(${Whiteheart})`,
        backgroundRepeat: "repeat",
        backgroundSize: "50px",
      }}
    >
      <div className="bg-white border-2 border-black rounded-2xl px-8 py-10 max-w-lg shadow-md">
        
        <img
          src={Logo}
          alt="Us with Time Logo"
          className="w-32 mx-auto mb-6"
        />

        <h1 className="text-4xl font-bold mb-4">404 💔</h1>

        <p className="mb-6 text-lg">
          This page doesn't exist
        </p>

        <Link
          to="/app"
          className="inline-block px-6 py-3 bg-[#ffb6d9] text-white border-2 border-black rounded-2xl hover:translate-y-1 transition-all duration-150"
        >
          Take me back home 💕
        </Link>
      </div>
    </div>
  );
}