export default async function handler(req, res) {
  try {
    if (req.method === 'OPTIONS') {
      return res.status(200).setHeader('Access-Control-Allow-Origin', '*').setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS').end();
    }

    if (req.method !== 'POST') {
      return res.status(405).setHeader('Access-Control-Allow-Origin', '*').setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS').json({ error: 'Method not allowed' });
    }

    if (!req.body || !req.body.code || !req.body.feature) {
      return res.status(400).setHeader('Access-Control-Allow-Origin', '*').setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS').json({ error: 'Invalid request body' });
    }

    const { code, feature } = req.body;
    let systemPrompt = '';

    switch (feature) {
      case 'Code Explanation':
        systemPrompt = `Explain the following code in simple terms: ${code}. Provide a step-by-step breakdown of what the code does and how it works.`;
        break;
      case 'Code Review':
        systemPrompt = `Review the following code and provide feedback on its quality, readability, and performance: ${code}. Identify any potential issues or areas for improvement.`;
        break;
      case 'Optimization Suggestions':
        systemPrompt = `Optimize the following code for better performance and efficiency: ${code}. Provide suggestions for improvement and explain the reasoning behind each suggestion.`;
        break;
      default:
        return res.status(400).setHeader('Access-Control-Allow-Origin', '*').setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS').json({ error: 'Invalid feature' });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'assistant', content: systemPrompt }],
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return res.status(200).setHeader('Access-Control-Allow-Origin', '*').setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS').json({ response: aiResponse });
  } catch (error) {
    console.error(error);
    return res.status(500).setHeader('Access-Control-Allow-Origin', '*').setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS').json({ error: 'Internal server error' });
  }
}