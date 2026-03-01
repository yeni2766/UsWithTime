import Logo from "./assets/logo.png";
import Whiteheart from "./assets/whiteheart.png";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth"; //this function basically helps to create account
import { auth } from "./firebase"; //auth will be used to identify the authentication system for this project
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); //this is to handle errors in the login page
  const [loading, setLoading] = useState(false); //this is to disable the login button while we are waiting for a result
  const Passwordlength = password.length >=8;
  const hasNumber = /\d/.test(password);
  const upperCase = /[A-Z]/.test(password);
  const isValid = Passwordlength && hasNumber && upperCase
  const navigate = useNavigate();
 
  const handleSignup = async(e) => {
    e.preventDefault();
    if(!isValid) return;
    setError("");
    setLoading(true);
    try{
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/app")
    }
    catch{
      setError('You have another account with this email. Try again')
    }
    finally{
      setLoading(false)
    }
  }

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
        <form onSubmit={handleSignup}  className="relative flex -top-15 lg:-top-10 flex-col gap-5 font-display">
          {loading && <p>Logging in…</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <p className={Passwordlength ? 'text-green-500':'text-red-500'}>• Be at least 8 characters</p>
          <p className={hasNumber ? 'text-green-500':'text-red-500' }>• Contain at least one number</p>
          <p className={upperCase ? 'text-green-500':'text-red-500' }>• Contain at least one uppercase letter</p>
          
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
              onChange={(e) => setEmail(e.target.value)}
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
            type="submit"
            aria-label="Click to Create Account"
            className="w-full py-3 text-lg uppercase bg-[#ffb6d9] text-white border-2 border-black rounded-2xl hover:translate-y-1 transition-all duration-150 ease-in cursor-pointer"
            disabled={loading}
            onClick={handleSignup}
          >
            Create Account
          </button>
        </form>
        <div className='flex flex-col justify-center items-center'>
            <ul>
                <Link to = '/login'><li className='font-display font-bold'>Already part of us? Log in 💕</li></Link>
            </ul>
        </div>
      </section>
    </div>
  );
}