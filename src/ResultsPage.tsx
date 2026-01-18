import React, { useState } from "react";
import { type ModelTranslation } from "./api/translate";

interface ResultsPageProps {
  original: string;
  translations: ModelTranslation[];
  from: string;
  to: string;
  role: string;
  onBack: () => void;
  onEvaluate: () => void;
}

// Model button colors - DRY: consistent styling
const MODEL_COLORS: Record<string, { bg: string; active: string; text: string }> = {
  chatgpt: { bg: 'bg-green-100 dark:bg-green-900/30', active: 'bg-green-500', text: 'text-green-700 dark:text-green-300' },
  gemini: { bg: 'bg-blue-100 dark:bg-blue-900/30', active: 'bg-blue-500', text: 'text-blue-700 dark:text-blue-300' },
  claude: { bg: 'bg-orange-100 dark:bg-orange-900/30', active: 'bg-orange-500', text: 'text-orange-700 dark:text-orange-300' },
  deepseek: { bg: 'bg-purple-100 dark:bg-purple-900/30', active: 'bg-purple-500', text: 'text-purple-700 dark:text-purple-300' },
  llama: { bg: 'bg-pink-100 dark:bg-pink-900/30', active: 'bg-pink-500', text: 'text-pink-700 dark:text-pink-300' },
};

const ResultsPage: React.FC<ResultsPageProps> = ({
  original,
  translations,
  from,
  to,
  role,
  onBack,
  onEvaluate,
}) => {
  const [selectedModel, setSelectedModel] = useState<string>(
    translations.find(t => t.translation)?.key || translations[0]?.key || 'chatgpt'
  );

  const currentTranslation = translations.find(t => t.key === selectedModel);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <div className="bg-white/95 dark:bg-gray-900/90 rounded-2xl p-8 max-w-4xl w-full shadow-2xl">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">
          Translation Comparison
        </h2>

        <div className="mb-4 text-sm text-gray-600 dark:text-gray-300 text-center">
          <span className="font-semibold">{from}</span> → <span className="font-semibold">{to}</span>
          {role && <span className="ml-2 text-purple-600 dark:text-purple-400">({role})</span>}
        </div>

        {/* Model Toggle Buttons - DRY: map over translations */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {translations.map((t) => {
            const colors = MODEL_COLORS[t.key] || MODEL_COLORS.chatgpt;
            const isActive = selectedModel === t.key;
            const hasError = t.error !== null;
            
            return (
              <button
                key={t.key}
                onClick={() => setSelectedModel(t.key)}
                disabled={hasError}
                className={`
                  px-4 py-2 rounded-full font-semibold transition-all duration-200
                  ${isActive 
                    ? `${colors.active} text-white shadow-lg scale-105` 
                    : `${colors.bg} ${colors.text} hover:scale-102`
                  }
                  ${hasError ? 'opacity-50 cursor-not-allowed line-through' : 'cursor-pointer'}
                `}
              >
                {t.name}
                {hasError && ' ❌'}
              </button>
            );
          })}
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
          <div className={`rounded-xl p-5 ${MODEL_COLORS[selectedModel]?.bg || 'bg-purple-100 dark:bg-purple-900/50'}`}>
            <h3 className={`text-lg font-semibold mb-3 ${MODEL_COLORS[selectedModel]?.text || 'text-purple-700 dark:text-purple-300'}`}>
              {currentTranslation?.name || 'Translation'} ({to})
            </h3>
            {currentTranslation?.error ? (
              <p className="text-red-500">Error: {currentTranslation.error}</p>
            ) : (
              <p className="text-gray-800 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">
                {currentTranslation?.translation || 'No translation available'}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 flex-wrap">
          <button
            onClick={onBack}
            className="px-6 py-3 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold"
          >
            ← Start Over
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(currentTranslation?.translation || '')}
            className="px-6 py-3 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors font-semibold"
          >
            Copy Translation
          </button>
          <button
            onClick={onEvaluate}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white hover:from-indigo-600 hover:to-pink-600 transition-colors font-semibold shadow-lg"
          >
            Evaluate Accuracy →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
