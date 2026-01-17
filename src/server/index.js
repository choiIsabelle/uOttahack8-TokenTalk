require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Debug: Log if API key is loaded
console.log('API Key loaded:', process.env.OPENROUTER_API_KEY ? 'Yes' : 'No');
console.log('Model:', process.env.OPENROUTER_MODEL);

app.post('/api/translate', async (req, res) => {
  const { role, from, to, text } = req.body;

  console.log('Received request:', { role, from, to, text: text?.slice(0, 50) });

  if (!text || !from || !to) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const prompt = `You are a professional ${role || 'translator'}. Translate the following text from ${from} to ${to}. Only return the translation, nothing else.\n\nText: ${text}`;

  try {
    console.log('Calling OpenRouter API...');
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'uOttaHack Translation App'
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    console.log('OpenRouter response:', JSON.stringify(data, null, 2));

    if (data.error) {
      console.error('OpenRouter error:', data.error);
      return res.status(500).json({ error: data.error.message || 'Translation failed' });
    }

    const translation = data.choices?.[0]?.message?.content || 'No translation returned';
    console.log('Translation successful:', translation.slice(0, 50));
    res.json({ translation, original: text, from, to, role });
  } catch (err) {
    console.error('Translation error:', err);
    res.status(500).json({ error: 'Translation failed. Please try again.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));