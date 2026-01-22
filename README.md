### uOttahack8 - Token Talk

TokenTalk was created for uOttahack8, hosted at the University of Ottawa (Winter 2026).
Project uses [OpenRouter SDK](https://openrouter.ai/docs/quickstart) to evaluate the efficiency of several Large Language Models when processing a user task.
The results are evaluated objectively utilzing modern machine learning processes.

## Techstack:

Front-end: React with Typescript, styled with Tailwind CSS
Back-end: Python and Node.js
Hosting: Github pages and AWS Lambda
API: [OpenRouter](https://openrouter.ai/docs/quickstart)

## Project Structure

src/
├── App.tsx              # Main React app entry; renders EntryPage and sets up global styles/background
├── App.css              # App-wide CSS, including gradient backgrounds and scoped styles
├── EntryPage.tsx        # Landing page with animated background, launches the multi-step wizard
├── LandingPage.tsx      # Multi-step wizard for role/language selection, file/text input, and validation
├── ResultsPage.tsx      # Displays translation results and allows copying or restarting
├── api/
│   └── translate.ts     # API utility for sending translation requests to the backend
├── main.tsx             # React root renderer; mounts App to the DOM
├── index.css            # Tailwind CSS imports and base styles
├── assets/
│   └── react.svg        # Example static asset (can include other images/icons)
└── server/
    ├── index.js         # Node.js Express backend for translation API (can be adapted for AWS Lambda)
    ├── .env             # Backend environment variables (API keys, model config) – ignored by git
    └── package.json     # Backend dependencies and scripts

## Local Set Up Instructions

1. Create the .env file in src/server with the following:

```
OPENROUTER_API_KEY=<YOUR_OPENROUTER_API_KEY>
OPENROUTER_MODEL=openai/gpt-4o-mini
// Other models
```

2. In one terminal, run `npm run dev`
3. Navigate to src/server, and run `npm install`, then `node index.js`
