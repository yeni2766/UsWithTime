import Whiteheart from "./assets/whiteheart.png";
import Logo from "./assets/logo.png";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
export default function Landing() {
  const navigate = useNavigate();
  return (
    <div
      className="flex flex-col justify-center items-center w-full min-h-[100svh] overflow-hidden px-8 lg:px-12 overflow-hidden"
      style={{
        backgroundColor: "#ffb6d9",
        backgroundImage: `url(${Whiteheart})`,
        backgroundRepeat: "repeat",
        backgroundSize: "50px",
      }}
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl border-2 border-black lg:px-6">
        <header className="flex flex-col items-center">
          <img src={Logo} alt="Us with Time" className="w-[50%] lg:w-[35%]" />
        </header>
        <div className="relative -top-5 flex flex-col justify-center mb-24 gap-6 lg:gap-4 p-8">
          <button
            className="w-full p-4 px-6 py-2 font-display text-lg bg-[#ffb6d9] text-white border-2 border-black rounded-2xl hover:translate-y-1 transition-all ease-in duration-150  cursor-pointer"
            onClick={() => navigate("/demo")}
          >
            Try the Demo
          </button>
          <button
            className="w-full p-4 px-6 py-2 font-display text-lg bg-[#ffb6d9] text-white border-2 border-black rounded-2xl hover:translate-y-1 transition-all ease-in duration-150 cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
          <div className="flex flex-col justify-center items-center">
            <ul>
              <Link to="/signup">
                <li className="font-display font-bold">
                  New here? Create your journal 💕
                </li>
              </Link>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}