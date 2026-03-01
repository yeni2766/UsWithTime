import Whiteheart from "./assets/whiteheart.png";
import Logo from "./assets/logo.png";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebase"; //auth will be used to identify the authentication system for this project
import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); //this is to handle errors in the login page
  const [loading, setLoading] = useState(false); //this is to disable the login button while we are waiting for a result
  const [resetMsg, setResetMsg] = useState(""); //this will be the message to resetmsg
  const [resetLoading, setResetLoading] = useState(false); //this will be to disable the loading link
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/app");
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const cleanedEmail = email.trim();

    if (!cleanedEmail) {
      setError("Enter your email first so I can send the reset link");
      return;
    }

    setError("");
    setResetMsg("");
    setResetLoading(true);

    try {
      await sendPasswordResetEmail(auth, cleanedEmail);
      setResetMsg(
        "Reset link sent — check your inbox (and spam just in case)."
      );
    } catch (err) {
      console.error("Reset password error:", err?.code, err?.message, err);
      setError("Could not send reset link. Check the email and try again.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center w-full min-h-[100svh] px-8 lg:px-12 overflow-hidden"
      style={{
        backgroundColor: "#ffb6d9",
        backgroundImage: `url(${Whiteheart})`,
        backgroundRepeat: "repeat",
        backgroundSize: "50px",
      }}
    >
      <section className="relative w-full max-w-lg bg-white rounded-2xl border-2 border-black px-6 py-8">
        {/* Logo */}
        <header className="flex flex-col items-center mb-6">
          <img
            src={Logo}
            alt="Logo of Us with Time"
            className="w-[60%] md:w-[35%]"
          />
        </header>

        {/* Form */}
        <form
          onSubmit={handleLogin}
          className="relative flex -top-15 lg:-top-10 flex-col gap-5 font-display"
        >
          {loading && <p>Logging in…</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {resetMsg && <p className="text-sm text-green-700">{resetMsg}</p>}

          {/* Email */}
          <div className="flex flex-col gap-2">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setResetMsg("");
                setError("");
              }}
              className="w-full px-4 py-3 bg-white border-2 border-black rounded-lg shadow-sm text-[#4a154b] placeholder:text-[#b8aeb3] transition-all duration-200"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white border-2 border-black rounded-lg shadow-sm text-[#4a154b] placeholder:text-[#b8aeb3] transition-all duration-200"
            />
          </div>
          <button
            type="button"
            onClick={handleResetPassword}
            disabled={resetLoading}
            className="text-sm underline underline-offset-4 text-[#4a154b] hover:opacity-70 cursor-pointer disabled:opacity-50"
          >
            {resetLoading ? "Sending reset link..." : "Forgot password?"}
          </button>

          {/* Login button */}
          <button
            type="submit"
            aria-label="Click to Login"
            className="w-full py-3 text-lg uppercase bg-[#ffb6d9] text-white border-2 border-black rounded-2xl hover:translate-y-1 transition-all duration-150 ease-in cursor-pointer"
            disabled={loading || resetLoading}
          >
            Login
          </button>
        </form>
        <div className="flex flex-col justify-center items-center w-full">
          <ul>
            <Link to="/signup">
              <li className="font-display font-bold">
                New here? Create your journal 💕
              </li>
            </Link>
          </ul>
        </div>
      </section>
    </div>
  );
}