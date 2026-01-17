import React, { useState } from "react";
import LandingPage from "./LandingPage";

const EntryPage: React.FC = () => {
  const [started, setStarted] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative bg-gradient-to-br from-indigo-700/60 via-blue-500/40 to-pink-400/30">
      <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none select-none">
        <img src="./geegees.png" alt="geegees logo" className="opacity-40" />
      </div>
      {/* Main content overlay */}
      <div className="relative z-10 w-full flex items-center justify-center">
        {!started ? (
          <div className="text-center text-white max-w-3xl">
            <h1
              className="text-4xl sm:text-5xl font-extrabold drop-shadow-lg shadow-black"
              style={{ textShadow: "0 4px 24px #000, 0 1px 0 #222" }}
            >
              Find the best AI model for translation!
            </h1>
            <p
              className="mt-4 text-xl font-semibold opacity-90 drop-shadow"
              style={{ textShadow: "0 4px 24px #000, 0 1px 0 #222" }}
            >
              Quickly pick your role, languages, and upload a file or paste text
              to translate.
            </p>
            <div className="mt-8">
              <button
                onClick={() => setStarted(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-full font-semibold shadow hover:scale-105 transition-transform"
              >
                Let's go!
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full">
            <LandingPage
              onBack={() => setStarted(false)}
              onFinish={(data) => {
                console.log("LandingPage finished:", data);
                setStarted(false);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EntryPage;
