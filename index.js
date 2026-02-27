require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({ origin: '*' }));          // sab frontend se allow
app.use(express.json());                 // JSON body parse karega

// Status check (frontend green dot ke liye)
app.get('/status', (req, res) => {
  res.json({
    status: 'online',
    message: 'Arkivon AI Backend Running 🚀',
    model: 'llama-3.3-70b-versatile'
  });
});

// Chat endpoint (frontend yahin message bhejega)
app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ error: 'Valid "message" is required' });
    }

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are Arkivon AI – a helpful, friendly and smart assistant by Arpit Maurya. Reply naturally in Hindi or English depending on the user.'
          },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_completion_tokens: 4096,
        stream: false
      })
    });

    if (!groqResponse.ok) {
      const errData = await groqResponse.json().catch(() => ({}));
      console.error('Groq error:', groqResponse.status, errData);
      return res.status(groqResponse.status).json({
        error: 'Groq API error',
        details: errData.error?.message || 'Unknown'
      });
    }

    const data = await groqResponse.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || 'No response';

    res.json({ reply });

  } catch (error) {
    console.error('Chat endpoint failed:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
