# uOttahack8

TokenTalk was created for uOttahack8, hosted at the University of Ottawa (Winter 2026).
Project uses [OpenRouter SDK](https://openrouter.ai/docs/quickstart) to evaluate the efficiency of several Large Language Models when processing a user task.
The results are evaluated objectively utilzing modern machine learning processes.

Techstack:
Front-end: React with Typescript, styled with Tailwind CSS
Back-end: Python and Node.js
Hosting: Github pages and AWS Lambda
API: [OpenRouter](https://openrouter.ai/docs/quickstart)

## Local Set Up Instructions

1. Create the .env file in src/server with the following:

```
OPENROUTER_API_KEY=<YOUR_OPENROUTER_API_KEY>
OPENROUTER_MODEL=openai/gpt-4o-mini
// Other models
```

2. In one terminal, run `npm run dev`
3. Navigate to src/server, and run `npm install`, then `node index.js`
