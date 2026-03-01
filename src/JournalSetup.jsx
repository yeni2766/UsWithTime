import Whiteheart from "./assets/whiteheart.png";
import Logo from "./assets/logo.png";
import { useState } from "react";

export default function JournalSetup({
  createJournal,
  joinJournal,
  loading,
  error,
}) {
  const [inviteCode, setInviteCode] = useState("");
  const [showJoin, setShowJoin] = useState(false);

  const handleJoin = (e) => {
    e.preventDefault();
    joinJournal(inviteCode);
  };

  return (
    <div
      className="flex flex-col items-center font-display justify-center w-full min-h-[100svh] px-8 lg:px-12 overflow-hidden"
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

        {/* Status */}
        {loading && <p className="text-sm font-display">Working on it…</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {/* Main buttons */}
        <div className="flex flex-col gap-4 mt-4">
          <button
            type="button"
            className="w-full py-3 text-lg uppercase bg-[#ffb6d9] text-white border-2 border-black rounded-2xl hover:translate-y-1 transition-all duration-150 ease-in cursor-pointer disabled:opacity-60 font-display"
            onClick={createJournal}
            disabled={loading}
          >
            Create Journal
          </button>

          <button
            type="button"
            className="w-full py-3 text-lg uppercase bg-white text-black border-2 border-black rounded-2xl hover:translate-y-1 transition-all duration-150 ease-in cursor-pointer disabled:opacity-60"
            onClick={() => setShowJoin((prev) => !prev)}
            disabled={loading}
          >
            Join Journal
          </button>
        </div>

        {/* Join form will show when clicked on */}
        {showJoin && (
          <form className="flex flex-col gap-3 mt-5" onSubmit={handleJoin}>
            <div className="flex flex-col gap-2">
              <label htmlFor="code" className="font-display">
                Invite Code:
              </label>
              <input
                id="code"
                value={inviteCode}
                onChange={(e) => {
                  setInviteCode(e.target.value.toUpperCase());
                }}
                placeholder="e.g. A7K9P2"
                className="w-full px-4 py-3 bg-white border-2 border-black rounded-lg shadow-sm text-[#4a154b] placeholder:text-[#b8aeb3] transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 text-lg uppercase bg-[#ffb6d9] text-white border-2 border-black rounded-2xl hover:translate-y-1 transition-all duration-150 ease-in cursor-pointer disabled:opacity-60"
              disabled={loading || !inviteCode.trim()}
            >
              Join with Code
            </button>
          </form>
        )}
      </section>
    </div>
  );
}