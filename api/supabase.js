// Vercel Edge Function - Supabase API Proxy
// Credentials are stored in Vercel Environment Variables

export const config = {
    runtime: 'edge',
};

export default async function handler(request) {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

  // Only allow POST requests
  if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
                status: 405,
                headers: { 'Content-Type': 'application/json' },
        });
  }

  try {
        const body = await request.json();
        const { endpoint, method = 'GET', data, params } = body;

      // Build URL with params
      let url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
        if (params) {
                url += `?${params}`;
        }

      // Make request to Supabase
      const fetchOptions = {
              method: method,
              headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation',
              },
      };

      if (data && (method === 'POST' || method === 'PATCH')) {
              fetchOptions.body = JSON.stringify(data);
      }

      const response = await fetch(url, fetchOptions);
        const responseData = await response.json();

      return new Response(JSON.stringify(responseData), {
              status: response.status,
              headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
              },
      });
  } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
        });
  }
}
