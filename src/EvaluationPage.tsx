import React, { useMemo } from "react";
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

// Lexical Similarity: Jaccard similarity of word sets
function calculateLexicalSimilarity(translations: string[]): number[] {
  if (translations.length < 2) return translations.map(() => 100);
  
  const tokenSets = translations.map(t => new Set(tokenize(t)));
  
  return tokenSets.map((set, i) => {
    // Compare with all other translations
    let totalSimilarity = 0;
    let comparisons = 0;
    
    tokenSets.forEach((otherSet, j) => {
      if (i !== j) {
        const intersection = new Set([...set].filter(x => otherSet.has(x)));
        const union = new Set([...set, ...otherSet]);
        totalSimilarity += union.size > 0 ? (intersection.size / union.size) * 100 : 0;
        comparisons++;
      }
    });
    
    return comparisons > 0 ? totalSimilarity / comparisons : 100;
  });
}

// Vector Space Similarity: TF-based cosine similarity
function calculateVectorSimilarity(translations: string[]): number[] {
  if (translations.length < 2) return translations.map(() => 100);
  
  // Build vocabulary
  const allTokens = translations.flatMap(t => tokenize(t));
  const vocab = [...new Set(allTokens)];
  
  // Create TF vectors
  const vectors = translations.map(t => {
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
  
  return vectors.map((vec, i) => {
    let totalSimilarity = 0;
    let comparisons = 0;
    
    vectors.forEach((otherVec, j) => {
      if (i !== j) {
        totalSimilarity += cosineSimilarity(vec, otherVec);
        comparisons++;
      }
    });
    
    return comparisons > 0 ? totalSimilarity / comparisons : 100;
  });
}

// Semantic Similarity: N-gram overlap + length consistency
function calculateSemanticSimilarity(translations: string[]): number[] {
  if (translations.length < 2) return translations.map(() => 100);
  
  // Get bigrams
  const getBigrams = (text: string): Set<string> => {
    const tokens = tokenize(text);
    const bigrams = new Set<string>();
    for (let i = 0; i < tokens.length - 1; i++) {
      bigrams.add(`${tokens[i]}_${tokens[i + 1]}`);
    }
    return bigrams;
  };
  
  const bigramSets = translations.map(getBigrams);
  const lengths = translations.map(t => tokenize(t).length);
  const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  
  return translations.map((_, i) => {
    // Bigram overlap with others
    let bigramScore = 0;
    let comparisons = 0;
    
    bigramSets.forEach((otherSet, j) => {
      if (i !== j) {
        const intersection = new Set([...bigramSets[i]].filter(x => otherSet.has(x)));
        const union = new Set([...bigramSets[i], ...otherSet]);
        bigramScore += union.size > 0 ? (intersection.size / union.size) * 100 : 0;
        comparisons++;
      }
    });
    
    const avgBigramScore = comparisons > 0 ? bigramScore / comparisons : 100;
    
    // Length consistency penalty
    const lengthScore = 100 - Math.min(50, Math.abs(lengths[i] - avgLength) * 5);
    
    // Combined semantic score
    return (avgBigramScore * 0.7 + lengthScore * 0.3);
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
  // Calculate scores for all successful translations
  const scores: ModelScore[] = useMemo(() => {
    const successfulTranslations = translations.filter(t => t.translation && !t.error);
    const translationTexts = successfulTranslations.map(t => t.translation!);
    
    const lexicalScores = calculateLexicalSimilarity(translationTexts);
    const vectorScores = calculateVectorSimilarity(translationTexts);
    const semanticScores = calculateSemanticSimilarity(translationTexts);
    
    return successfulTranslations.map((t, i) => ({
      key: t.key,
      name: t.name,
      translation: t.translation!,
      lexicalScore: lexicalScores[i],
      vectorScore: vectorScores[i],
      semanticScore: semanticScores[i],
      overallScore: (lexicalScores[i] + vectorScores[i] + semanticScores[i]) / 3,
    }));
  }, [translations]);

  // Sort by overall score
  const sortedScores = [...scores].sort((a, b) => b.overallScore - a.overallScore);

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
              <p className="text-sm text-gray-600 dark:text-gray-400">Word overlap between translations (Jaccard index)</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <h4 className="font-semibold text-green-700 dark:text-green-300 mb-1">🎯 Vector Similarity</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Keyword & context similarity (TF cosine)</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-1">🧠 Semantic Similarity</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Meaning & structure consistency (N-gram + length)</p>
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
