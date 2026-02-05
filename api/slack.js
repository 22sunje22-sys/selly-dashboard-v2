// Vercel Serverless Function to proxy Slack webhook
// This bypasses CORS restrictions

export default async function handler(req, res) {
      // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
      res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-Type, Date, X-Api-Version');

    // Handle preflight
    if (req.method === 'OPTIONS') {
              res.status(200).end();
              return;
    }

    if (req.method !== 'POST') {
              return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
              const { text } = req.body;

          if (!text) {
                        return res.status(400).json({ error: 'Message text is required' });
          }

          // Slack webhook URL
        const SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/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';
          const response = await fetch(SLACK_WEBHOOK_URL, {
                        method: 'POST',
                        headers: {
                                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ text })
          });

          if (!response.ok) {
                        const errorText = await response.text();
                        console.error('Slack API error:', errorText);
                        return res.status(response.status).json({ error: 'Failed to send to Slack', details: errorText });
          }

          return res.status(200).json({ success: true });
    } catch (error) {
              console.error('Slack notification error:', error);
              return res.status(500).json({ error: 'Internal server error', message: error.message });
    }
}
