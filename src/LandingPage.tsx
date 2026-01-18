import React, { useState } from "react";

type LandingPageProps = {
  titlePrompt?: string;
  options?: string[];
  subtitle?: string;
  onNext?: (selected: string | null) => void;
  // Called when the full setup is finished (role + languages + optional file)
  onFinish?: (selection: {
    role: string | null;
    from: string | null;
    to: string | null;
    file?: File | null;
    text?: string | null;
  }) => void;
  onBack?: () => void;
  initialSelected?: string | null;
};

const DEFAULT_OPTIONS = [
  "Student",
  "Educator",
  "Professional",
  "Researcher",
  "Other",
];

const LandingPage: React.FC<LandingPageProps> = ({
  titlePrompt = "What best describes you?",
  subtitle = "Choose the option that most closely matches your background.",
  options = DEFAULT_OPTIONS,
  onNext,
  onFinish,
  onBack,
  initialSelected = null,
}) => {
  const [selected, setSelected] = useState<string | null>(initialSelected);
  const [step, setStep] = useState<number>(0); // 0 = role, 1 = languages
  const LANGUAGES = [
    "English",
    "Spanish",
    "French",
    "German",
    "Chinese",
    "Japanese",
    "Korean",
    "Portuguese",
    "Italian",
    "Russian",
  ];
  const LANGUAGE_EMOJI: Record<string, string> = {
    English: "🇺🇸",
    Spanish: "🇪🇸",
    French: "🇫🇷",
    German: "🇩🇪",
    Chinese: "🇨🇳",
    Japanese: "🇯🇵",
    Korean: "🇰🇷",
    Portuguese: "🇵🇹",
    Italian: "🇮🇹",
    Russian: "🇷🇺",
  };
  const [fromLang, setFromLang] = useState<string | null>(null);
  const [toLang, setToLang] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [textInput, setTextInput] = useState<string>("");
  const [textError, setTextError] = useState<string | null>(null);

  const validateFile = (f: File) => {
    const allowedMimes = [
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const allowedExts = [".txt", ".doc", ".docx"];
    const name = f.name.toLowerCase();
    const extOk = allowedExts.some((ext) => name.endsWith(ext));
    const mimeOk = allowedMimes.includes(f.type);
    return mimeOk || extOk;
  };
  const percent = Math.round((step / 2) * 100);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white/90 dark:bg-gray-900/80 backdrop-blur rounded-2xl shadow-lg p-8">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${percent}%` }}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
            />
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
            Step {step + 1} of 3
          </div>
        </div>
        {step === 0 ? (
          <>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-6 text-center">
              {titlePrompt}
            </h1>

            <p className="text-center text-gray-600 dark:text-gray-400 mb-12">
              {subtitle}
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {options.length === 0 && (
                <div className="text-sm text-gray-500">
                  No options provided.
                </div>
              )}

              {options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSelected((s) => (s === opt ? null : opt))}
                  className={`text-2xl px-6 py-3 rounded-full transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    selected === opt
                      ? "bg-blue-600 text-white shadow-lg transform scale-105"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:scale-105"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-center mt-6">
              <div className="flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={!selected}
                  className={`text-lg px-4 py-2 rounded-full font-medium transition ${
                    selected
                      ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                      : "bg-blue-100 text-blue-700 cursor-not-allowed opacity-60"
                  } focus:outline-none focus:ring-2 focus:ring-blue-400`}
                >
                  Next
                </button>

                <button
                  type="button"
                  onClick={() => onBack?.()}
                  className="text-lg px-4 py-2 rounded-full text-blue-600 dark:text-blue-400 hover:underline focus:outline-none"
                >
                  Back
                </button>
              </div>
            </div>
          </>
        ) : step === 1 ? (
          // Step 1: language selection
          <>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">
              Choose languages
            </h1>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
              Select the origin language and the language to translate to.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  From
                </label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((lang) => {
                    const disabled = toLang === lang; // prevent choosing same as destination
                    return (
                      <button
                        key={lang}
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                          if (disabled) return;
                          setFromLang((l) => (l === lang ? null : lang));
                          if (toLang === lang) setToLang(null);
                        }}
                        className={`px-4 py-2 rounded-full border transition ${
                          fromLang === lang
                            ? "bg-blue-600 text-white border-blue-600"
                            : disabled
                            ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-60"
                            : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 hover:scale-105"
                        }`}
                      >
                        <span className="mr-2">
                          {LANGUAGE_EMOJI[lang] ?? "🌐"}
                        </span>
                        {lang}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  To
                </label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((lang) => {
                    const disabled = fromLang === lang; // prevent choosing same as origin
                    return (
                      <button
                        key={lang}
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                          if (disabled) return;
                          setToLang((l) => (l === lang ? null : lang));
                          if (fromLang === lang) setFromLang(null);
                        }}
                        className={`px-4 py-2 rounded-full border transition ${
                          toLang === lang
                            ? "bg-blue-600 text-white border-blue-600"
                            : disabled
                            ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-60"
                            : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 hover:scale-105"
                        }`}
                      >
                        <span className="mr-2">
                          {LANGUAGE_EMOJI[lang] ?? "🌐"}
                        </span>
                        {lang}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center mt-6">
              <div className="flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    // Keep backward-compatible onNext (role only)
                    onNext?.(selected);
                    setStep(2);
                  }}
                  disabled={!fromLang || !toLang || fromLang === toLang}
                  className={`text-lg px-4 py-2 rounded-full font-medium transition ${
                    fromLang && toLang
                      ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                      : "bg-blue-100 text-blue-700 cursor-not-allowed opacity-60"
                  } focus:outline-none focus:ring-2 focus:ring-blue-400`}
                >
                  Next
                </button>

                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="text-lg px-4 py-2 rounded-full text-blue-600 dark:text-blue-400 hover:underline focus:outline-none"
                >
                  Back
                </button>
              </div>
            </div>
          </>
        ) : (
          // Step 2: file upload
          <>
            {/* Summary of chosen languages */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-medium">
                <span className="mr-2">
                  {LANGUAGE_EMOJI[fromLang ?? ""] ?? "🌐"}
                </span>
                {fromLang ?? "—"}
              </div>
              <div className="text-sm">→</div>
              <div className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-medium">
                <span className="mr-2">
                  {LANGUAGE_EMOJI[toLang ?? ""] ?? "🌐"}
                </span>
                {toLang ?? "—"}
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">
              Upload file
            </h1>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
              Upload a text or Word document to translate (.txt, .doc, .docx).
              Images/videos are not accepted.
            </p>

            <div className="flex flex-col items-center gap-4 mb-6">
              <label className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-full cursor-pointer hover:bg-blue-100">
                <input
                  type="file"
                  accept=".txt,.doc,.docx,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) {
                      setFile(null);
                      setFileError(null);
                      return;
                    }
                    if (!validateFile(f)) {
                      setFile(null);
                      setFileError(
                        "Invalid file type. Please upload .txt, .doc, or .docx"
                      );
                      return;
                    }
                    setFile(f);
                    setFileError(null);
                  }}
                />
                Choose file
              </label>

              {file && (
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Selected: <span className="font-medium">{file.name}</span>{" "}
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="ml-2 text-blue-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}

              {file && <div className="text-sm text-red-600">{fileError}</div>}
            </div>

            <div className="w-full">
              {fileError && (
                <div className="text-sm text-red-600">{fileError}</div>
              )}
              <div className="w-full mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Or paste text to translate
                </label>
                <textarea
                  value={textInput}
                  onChange={(e) => {
                    setTextInput(e.target.value);
                    if (e.target.value.trim() || file) setTextError(null);
                  }}
                  placeholder="Paste or type text here as an alternative to uploading a file"
                  className={`w-full min-h-[120px] p-3 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                    textError ? "border-red-500" : ""
                  }`}
                />
              </div>

              <div className="flex items-center justify-center mt-6">
                <div className="flex flex-col items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (!file && !textInput.trim()) {
                        setTextError(
                          "Please provide text to translate (either upload a file or enter text)."
                        );
                        return;
                      }
                      setTextError(null);
                      onFinish?.({
                        role: selected,
                        from: fromLang,
                        to: toLang,
                        file,
                        text: textInput || null,
                      });
                    }}
                    className={`text-lg px-4 py-2 rounded-full font-medium transition bg-blue-600 text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400`}
                  >
                    Translate
                  </button>
                  {textError && (
                    <div className="mt-2 text-red-600 text-sm text-center">
                      {textError}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-lg px-4 py-2 rounded-full text-blue-600 dark:text-blue-400 hover:underline focus:outline-none"
                  >
                    Back
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
