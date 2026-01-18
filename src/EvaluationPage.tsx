import React from "react";
import { type ModelTranslation } from "./api/translate";

interface EvaluationPageProps {
  original: string;
  translations: ModelTranslation[];
  from: string;
  to: string;
  onBack: () => void;
}

interface ModelScore {
  key: string;
  name: string;
  translation: string;
  lexicalScore: number;
  vectorScore: number;
  semanticScore: number;
  overallScore: number;
}

// DRY: Reuse model colors from ResultsPage
const MODEL_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  chatgpt: { bg: 'bg-green-100 dark:bg-green-900/30', border: 'border-green-500', text: 'text-green-700 dark:text-green-300' },
  gemini: { bg: 'bg-blue-100 dark:bg-blue-900/30', border: 'border-blue-500', text: 'text-blue-700 dark:text-blue-300' },
  claude: { bg: 'bg-orange-100 dark:bg-orange-900/30', border: 'border-orange-500', text: 'text-orange-700 dark:text-orange-300' },
  deepseek: { bg: 'bg-purple-100 dark:bg-purple-900/30', border: 'border-purple-500', text: 'text-purple-700 dark:text-purple-300' },
  llama: { bg: 'bg-pink-100 dark:bg-pink-900/30', border: 'border-pink-500', text: 'text-pink-700 dark:text-pink-300' },
};

// --- Scoring Functions ---

// Tokenize text into words (basic implementation)
function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 0);
}

// Lexical Similarity: Jaccard similarity with original text
function calculateLexicalSimilarity(original: string, backTranslations: string[]): number[] {
  if (backTranslations.length === 0) return [];
  
  const originalTokens = new Set(tokenize(original));
  
  return backTranslations.map(backTranslation => {
    const backTokens = new Set(tokenize(backTranslation));
    const intersection = new Set([...originalTokens].filter(x => backTokens.has(x)));
    const union = new Set([...originalTokens, ...backTokens]);
    return union.size > 0 ? (intersection.size / union.size) * 100 : 0;
  });
}

// Vector Space Similarity: TF-based cosine similarity with original
function calculateVectorSimilarity(original: string, backTranslations: string[]): number[] {
  if (backTranslations.length === 0) return [];
  
  // Build vocabulary from original + all back-translations
  const allTokens = [original, ...backTranslations].flatMap(t => tokenize(t));
  const vocab = [...new Set(allTokens)];
  
  // Create TF vectors
  const originalVec = vocab.map(word => tokenize(original).filter(w => w === word).length);
  const vectors = backTranslations.map(t => {
    const tokens = tokenize(t);
    return vocab.map(word => tokens.filter(w => w === word).length);
  });
  
  // Cosine similarity
  const cosineSimilarity = (a: number[], b: number[]): number => {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return magnitudeA && magnitudeB ? (dotProduct / (magnitudeA * magnitudeB)) * 100 : 0;
  };
  
  return vectors.map(vec => cosineSimilarity(originalVec, vec));
}

// Semantic Similarity: N-gram overlap + length consistency with original
function calculateSemanticSimilarity(original: string, backTranslations: string[]): number[] {
  if (backTranslations.length === 0) return [];
  
  // Get bigrams
  const getBigrams = (text: string): Set<string> => {
    const tokens = tokenize(text);
    const bigrams = new Set<string>();
    for (let i = 0; i < tokens.length - 1; i++) {
      bigrams.add(`${tokens[i]}_${tokens[i + 1]}`);
    }
    return bigrams;
  };
  
  const originalBigrams = getBigrams(original);
  const originalLength = tokenize(original).length;
  
  return backTranslations.map(backTranslation => {
    const backBigrams = getBigrams(backTranslation);
    const backLength = tokenize(backTranslation).length;
    
    // Bigram overlap with original
    const intersection = new Set([...originalBigrams].filter(x => backBigrams.has(x)));
    const union = new Set([...originalBigrams, ...backBigrams]);
    const bigramScore = union.size > 0 ? (intersection.size / union.size) * 100 : 0;
    
    // Length consistency score
    const lengthScore = 100 - Math.min(50, Math.abs(backLength - originalLength) * 5);
    
    // Combined semantic score
    return (bigramScore * 0.7 + lengthScore * 0.3);
  });
}

// Score bar component - DRY
const ScoreBar: React.FC<{ label: string; score: number; color: string }> = ({ label, score, color }) => (
  <div className="mb-2">
    <div className="flex justify-between text-sm mb-1">
      <span className="text-gray-600 dark:text-gray-400">{label}</span>
      <span className="font-semibold">{score.toFixed(1)}%</span>
    </div>
    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <div
        className={`h-full ${color} transition-all duration-500`}
        style={{ width: `${score}%` }}
      />
    </div>
  </div>
);

const EvaluationPage: React.FC<EvaluationPageProps> = ({
  original,
  translations,
  from,
  to,
  onBack,
}) => {
  const [scores, setScores] = React.useState<ModelScore[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  // Create a stable cache key for the current evaluation
  const cacheKey = React.useMemo(() => {
    const translationHash = translations
      .map(t => `${t.key}:${t.translation}`)
      .join('|');
    return `backTranslations_${from}_${to}_${translationHash}`;
  }, [translations, from, to]);
  
  // Calculate scores using back-translations
  React.useEffect(() => {
    const calculateScores = async () => {
      try {
        const successfulTranslations = translations.filter(t => t.translation && !t.error);
        
        let backTranslations = null;
        
        // Check if we have cached back-translations
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
          console.log('Using cached back-translations');
          backTranslations = JSON.parse(cachedData);
        } else {
          // Fetch back-translations if not cached
          console.log('Fetching new back-translations');
          const backTransRes = await fetch('/api/back-translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              translations: successfulTranslations,
              from,
              to
            })
          });

          if (!backTransRes.ok) {
            throw new Error('Failed to fetch back-translations');
          }

          const backTransData = await backTransRes.json();
          backTranslations = backTransData.backTranslations;
          
          // Cache the back-translations for future reloads
          localStorage.setItem(cacheKey, JSON.stringify(backTranslations));
        }

        // Calculate scores using back-translations
        const backTranslationTexts = backTranslations
          .filter((bt: any) => bt.backTranslation)
          .map((bt: any) => bt.backTranslation);

        const lexicalScores = calculateLexicalSimilarity(original, backTranslationTexts);
        const vectorScores = calculateVectorSimilarity(original, backTranslationTexts);
        const semanticScores = calculateSemanticSimilarity(original, backTranslationTexts);

        // Map scores back to models
        const calculatedScores = successfulTranslations
          .map((t, i) => {
            const backTrans = backTranslations.find((bt: any) => bt.key === t.key);
            if (!backTrans?.backTranslation) {
              return null;
            }
            return {
              key: t.key,
              name: t.name,
              translation: t.translation!,
              lexicalScore: lexicalScores[i],
              vectorScore: vectorScores[i],
              semanticScore: semanticScores[i],
              overallScore: (lexicalScores[i] + vectorScores[i] + semanticScores[i]) / 3,
            };
          })
          .filter((score): score is ModelScore => score !== null);

        setScores(calculatedScores);
        setLoading(false);
      } catch (err) {
        console.error('Error calculating scores:', err);
        setLoading(false);
      }
    };

    calculateScores();
  }, [cacheKey, translations, original]);

  // Sort by overall score
  const sortedScores = [...scores].sort((a, b) => b.overallScore - a.overallScore);

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="bg-white/95 dark:bg-gray-900/90 rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-800 dark:text-white">
            Back-translating and evaluating accuracy...
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            This may take a moment
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/95 dark:bg-gray-900/90 rounded-2xl p-8 shadow-2xl mb-6">
          <h2 className="text-3xl font-bold mb-2 text-center text-gray-800 dark:text-white">
            Translation Accuracy Evaluation
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            Comparing {scores.length} models • {from} → {to}
          </p>

          {/* Original text reference */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Original Text</h3>
            <p className="text-gray-800 dark:text-gray-100">{original}</p>
          </div>

          {/* Scoring methodology */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-1">📊 Lexical Similarity</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Word overlap between back-translation and original (Jaccard index)</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <h4 className="font-semibold text-green-700 dark:text-green-300 mb-1">🎯 Vector Similarity</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Keyword & context similarity with original (TF cosine)</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-1">🧠 Semantic Similarity</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">N-gram & length consistency with original</p>
            </div>
          </div>
        </div>

        {/* Model Rankings */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedScores.map((score, rank) => {
            const colors = MODEL_COLORS[score.key] || MODEL_COLORS.chatgpt;
            return (
              <div
                key={score.key}
                className={`${colors.bg} border-2 ${colors.border} rounded-xl p-5 shadow-lg`}
              >
                {/* Rank badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xl font-bold ${colors.text}`}>{score.name}</span>
                  <span className={`
                    px-3 py-1 rounded-full text-sm font-bold
                    ${rank === 0 ? 'bg-yellow-400 text-yellow-900' : 
                      rank === 1 ? 'bg-gray-300 text-gray-700' :
                      rank === 2 ? 'bg-orange-400 text-orange-900' :
                      'bg-gray-200 text-gray-600'}
                  `}>
                    #{rank + 1}
                  </span>
                </div>

                {/* Overall score */}
                <div className="text-center mb-4">
                  <span className="text-4xl font-bold text-gray-800 dark:text-white">
                    {score.overallScore.toFixed(1)}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 ml-1">%</span>
                </div>

                {/* Individual scores */}
                <ScoreBar label="Lexical" score={score.lexicalScore} color="bg-blue-500" />
                <ScoreBar label="Vector" score={score.vectorScore} color="bg-green-500" />
                <ScoreBar label="Semantic" score={score.semanticScore} color="bg-purple-500" />

                {/* Translation preview */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                    {score.translation}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Back button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={onBack}
            className="px-8 py-4 rounded-full bg-white text-purple-600 hover:bg-gray-100 transition-colors font-semibold shadow-lg"
          >
            ← Back to Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default EvaluationPage;
