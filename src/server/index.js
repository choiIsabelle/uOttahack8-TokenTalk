require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Model configuration - DRY: single source of truth
const MODELS = {
  chatgpt: {
    id: process.env.MODEL_CHATGPT || 'openai/gpt-4o-mini',
    name: 'ChatGPT 5.2'
  },
  gemini: {
    id: process.env.MODEL_GEMINI || 'google/gemini-2.0-flash-001',
    name: 'Google Gemini 3 Flash'
  },
  claude: {
    id: process.env.MODEL_CLAUDE || 'anthropic/claude-3-5-haiku',
    name: 'Claude Haiku 4.5'
  },
  deepseek: {
    id: process.env.MODEL_DEEPSEEK || 'deepseek/deepseek-chat',
    name: 'DeepSeek V3.2'
  },
  llama: {
    id: process.env.MODEL_LLAMA || 'meta-llama/llama-4-scout',
    name: 'Llama 4 Scout'
  }
};

console.log('API Key loaded:', process.env.OPENROUTER_API_KEY ? 'Yes' : 'No');
console.log('Models loaded:', Object.keys(MODELS).join(', '));

// Helper function to call OpenRouter API - DRY
async function callOpenRouter(modelId, prompt) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:5173',
      'X-Title': 'uOttaHack Translation App'
    },
    body: JSON.stringify({
      model: modelId,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  return response.json();
}

// Get list of available models
app.get('/api/models', (req, res) => {
  const models = Object.entries(MODELS).map(([key, value]) => ({
    key,
    id: value.id,
    name: value.name
  }));
  res.json({ models });
});

// Translate with ALL models in parallel
app.post('/api/translate-all', async (req, res) => {
  const { role, from, to, text } = req.body;

  console.log('Received multi-model request:', { role, from, to, text: text?.slice(0, 50) });

  if (!text || !from || !to) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const prompt = `You are a professional ${role || 'translator'}. Translate the following text from ${from} to ${to}. Only return the translation, nothing else.\n\nText: ${text}`;

  try {
    console.log('Calling all models in parallel...');
    
    // Call all models in parallel - DRY
    const translationPromises = Object.entries(MODELS).map(async ([key, model]) => {
      try {
        const data = await callOpenRouter(model.id, prompt);
        if (data.error) {
          console.error(`Error from ${model.name}:`, data.error);
          return { key, name: model.name, translation: null, error: data.error.message };
        }
        const translation = data.choices?.[0]?.message?.content || 'No translation returned';
        console.log(`${model.name} translation:`, translation.slice(0, 50));
        return { key, name: model.name, translation, error: null };
      } catch (err) {
        console.error(`Error calling ${model.name}:`, err.message);
        return { key, name: model.name, translation: null, error: err.message };
      }
    });

    const translations = await Promise.all(translationPromises);
    
    res.json({
      original: text,
      from,
      to,
      role,
      translations
    });
  } catch (err) {
    console.error('Translation error:', err);
    res.status(500).json({ error: 'Translation failed. Please try again.' });
  }
});

// Single model translation (legacy endpoint)
app.post('/api/translate', async (req, res) => {
  const { role, from, to, text, model: modelKey } = req.body;

  console.log('Received request:', { role, from, to, text: text?.slice(0, 50), model: modelKey });

  if (!text || !from || !to) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const model = MODELS[modelKey] || MODELS.chatgpt;
  const prompt = `You are a professional ${role || 'translator'}. Translate the following text from ${from} to ${to}. Only return the translation, nothing else.\n\nText: ${text}`;

  try {
    console.log(`Calling ${model.name}...`);
    const data = await callOpenRouter(model.id, prompt);
    console.log('OpenRouter response:', JSON.stringify(data, null, 2));

    if (data.error) {
      console.error('OpenRouter error:', data.error);
      return res.status(500).json({ error: data.error.message || 'Translation failed' });
    }

    const translation = data.choices?.[0]?.message?.content || 'No translation returned';
    console.log('Translation successful:', translation.slice(0, 50));
    res.json({ translation, original: text, from, to, role, model: model.name });
  } catch (err) {
    console.error('Translation error:', err);
    res.status(500).json({ error: 'Translation failed. Please try again.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));