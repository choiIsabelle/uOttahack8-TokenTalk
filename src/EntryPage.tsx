import React, { useState } from "react";
import LandingPage from "./LandingPage";
import ResultsPage from "./ResultsPage";
import EvaluationPage from "./EvaluationPage";
import { translateWithAllModels, type MultiTranslateResponse } from "./api/translate";

type FinishData = {
  role: string | null;
  from: string | null;
  to: string | null;
  file?: File | null;
  text?: string | null;
};

type PageView = 'home' | 'landing' | 'results' | 'evaluation';

const EntryPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageView>('home');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [translationResult, setTranslationResult] = useState<MultiTranslateResponse | null>(null);

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
      // Call all models in parallel
      const result = await translateWithAllModels({
        role: data.role,
        from: data.from,
        to: data.to,
        text: textContent,
      });
      setTranslationResult(result);
      setCurrentPage('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Translation failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Evaluation Page ---------------- */
  if (currentPage === 'evaluation' && translationResult) {
    return (
      <EvaluationPage
        original={translationResult.original}
        translations={translationResult.translations}
        from={translationResult.from}
        to={translationResult.to}
        onBack={() => setCurrentPage('results')}
      />
    );
  }

  /* ---------------- Results Page ---------------- */
  if (currentPage === 'results' && translationResult) {
    return (
      <ResultsPage
        original={translationResult.original}
        translations={translationResult.translations}
        from={translationResult.from}
        to={translationResult.to}
        role={translationResult.role}
        onBack={() => {
          setTranslationResult(null);
          setCurrentPage('home');
        }}
        onEvaluate={() => setCurrentPage('evaluation')}
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
            Translating with 5 AI models...
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            ChatGPT • Gemini • Claude • DeepSeek • Llama
          </p>
        </div>
      </div>
    );
  }

  /* ---------------- Landing Page (form) ---------------- */
  if (currentPage === 'landing') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative bg-gradient-to-br from-indigo-700/60 via-blue-500/40 to-pink-400/30">
        <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none select-none">
          <img
            src={`${import.meta.env.BASE_URL}geegees.png`}
            alt="geegees logo"
            className="max-w-xs sm:max-w-md md:max-w-lg w-2/3 opacity-40"
          />
        </div>
        <div className="relative z-10 w-full flex items-center justify-center">
          <div className="w-full">
            <LandingPage
              onBack={() => setCurrentPage('home')}
              onFinish={handleFinish}
            />
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- Home Page ---------------- */
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
            Compare translations from 5 leading AI models and see which one performs best.
          </p>

          {/* Model badges */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {['ChatGPT 5.2', 'Gemini 3 Flash', 'Claude Haiku 4.5', 'DeepSeek V3.2', 'Llama 4 Scout'].map(model => (
              <span key={model} className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur">
                {model}
              </span>
            ))}
          </div>

          <div className="mt-8">
            <button
              onClick={() => setCurrentPage('landing')}
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
      </div>
    </div>
  );
};

export default EntryPage;
