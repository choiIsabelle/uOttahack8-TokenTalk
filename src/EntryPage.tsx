import React, { useState } from "react";
import LandingPage from "./LandingPage";

const EntryPage: React.FC = () => {
  const [started, setStarted] = useState(false);
  type FinishData = {
    role: string | null;
    from: string | null;
    to: string | null;
    file?: File | null;
    text?: string | null;
  };
  const [result, setResult] = useState<FinishData | null>(null);

  if (!started && result) {
    // show summary after finish
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
        <div className="bg-white/90 dark:bg-gray-900/70 rounded-xl p-8 max-w-xl w-full text-center text-gray-800 dark:text-gray-100">
          <h2 className="text-2xl font-bold mb-4">Setup complete</h2>
          <p className="mb-4">Here's what you selected:</p>
          <div className="mb-4 text-left">
            <div>
              <strong>Role:</strong> {result.role ?? "—"}
            </div>
            <div>
              <strong>From:</strong> {result.from ?? "—"}
            </div>
            <div>
              <strong>To:</strong> {result.to ?? "—"}
            </div>
            {result.file && (
              <div>
                <strong>File:</strong> {result.file.name}
              </div>
            )}
            {result.text && (
              <div>
                <strong>Text:</strong> {result.text.slice(0, 200)}
                {result.text.length > 200 ? "..." : ""}
              </div>
            )}
          </div>
          <div className="flex justify-center gap-3">
            <button
              className="px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              onClick={() => {
                setResult(null);
                setStarted(false);
              }}
            >
              Start over
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      {!started ? (
        <div className="text-center text-white max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-extrabold">
            Find the best AI model for translation!
          </h1>
          <p className="mt-4 text-lg opacity-90">
            Quickly pick your role, languages, and upload a file or paste text
            to translate.
          </p>

          <div className="mt-8">
            <button
              onClick={() => setStarted(true)}
              className="px-6 py-3 bg-white text-blue-600 rounded-full font-semibold shadow hover:scale-105 transition-transform"
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
              setResult(data);
              setStarted(false);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default EntryPage;
