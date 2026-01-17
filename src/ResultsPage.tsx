import React from "react";

interface ResultsPageProps {
  original: string;
  translation: string;
  from: string;
  to: string;
  role: string;
  onBack: () => void;
}

const ResultsPage: React.FC<ResultsPageProps> = ({
  original,
  translation,
  from,
  to,
  role,
  onBack,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <div className="bg-white/95 dark:bg-gray-900/90 rounded-2xl p-8 max-w-3xl w-full shadow-2xl">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">
          Translation Complete
        </h2>

        <div className="mb-4 text-sm text-gray-600 dark:text-gray-300 text-center">
          <span className="font-semibold">{from}</span> → <span className="font-semibold">{to}</span>
          {role && <span className="ml-2 text-purple-600 dark:text-purple-400">({role})</span>}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Original Text */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-5">
            <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-200">
              Original ({from})
            </h3>
            <p className="text-gray-800 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">
              {original}
            </p>
          </div>

          {/* Translation */}
          <div className="bg-purple-100 dark:bg-purple-900/50 rounded-xl p-5">
            <h3 className="text-lg font-semibold mb-3 text-purple-700 dark:text-purple-300">
              Translation ({to})
            </h3>
            <p className="text-gray-800 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">
              {translation}
            </p>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={onBack}
            className="px-6 py-3 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold"
          >
            ← Start Over
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(translation)}
            className="px-6 py-3 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors font-semibold"
          >
            Copy Translation
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
