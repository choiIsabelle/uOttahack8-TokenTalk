import React, { useState } from "react";
import LandingPage from "./LandingPage";
import ResultsPage from "./ResultsPage";
import { translateText, type TranslateResponse } from "./api/translate";

type FinishData = {
  role: string | null;
  from: string | null;
  to: string | null;
  file?: File | null;
  text?: string | null;
};

const EntryPage: React.FC = () => {
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [translationResult, setTranslationResult] =
    useState<TranslateResponse | null>(null);

  const handleFinish = async (data: FinishData) => {
    console.log("LandingPage finished:", data);

    let textContent = data.text || "";

    if (data.file && !textContent) {
      textContent = await data.file.text();
    }

    if (!textContent.trim()) {
      setError("Please provide text to translate");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await translateText({
        role: data.role,
        from: data.from,
        to: data.to,
        text: textContent,
      });
      setTranslationResult(result);
      setStarted(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Translation failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Results Page ---------------- */
  if (translationResult) {
    return (
      <ResultsPage
        original={translationResult.original}
        translation={translationResult.translation}
        from={translationResult.from}
        to={translationResult.to}
        role={translationResult.role}
        onBack={() => setTranslationResult(null)}
      />
    );
  }

  /* ---------------- Loading Screen ---------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-indigo-700 via-purple-600 to-pink-500">
        <div className="bg-white/90 dark:bg-gray-900/70 rounded-xl p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-800 dark:text-white">
            Translating...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative bg-gradient-to-br from-indigo-700/60 via-blue-500/40 to-pink-400/30">
      {/* Background logo */}
      <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none select-none">
        <img
          src={`${import.meta.env.BASE_URL}geegees.png`}
          alt="geegees logo"
          className="max-w-xs sm:max-w-md md:max-w-lg w-2/3 opacity-40"
        />
      </div>

      {/* Foreground content */}
      <div className="relative z-10 w-full flex items-center justify-center">
        {!started ? (
          <div className="text-center text-white max-w-3xl">
            <h1
              className="text-4xl sm:text-5xl font-extrabold drop-shadow-lg"
              style={{ textShadow: "0 4px 24px #000, 0 1px 0 #222" }}
            >
              Find the best AI model for translation!
            </h1>

            <p
              className="mt-4 text-xl font-semibold opacity-90"
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
                Let&apos;s go!
              </button>
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-500/80 rounded-lg text-white">
                {error}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full">
            <LandingPage
              onBack={() => setStarted(false)}
              onFinish={handleFinish}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EntryPage;
