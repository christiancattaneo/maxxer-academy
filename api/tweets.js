// Vercel serverless function — proxies X API v2
// Required env vars: X_API_KEY, X_API_SECRET

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');

  const ids = req.query.ids;
  if (!ids) return res.status(400).json({ error: 'ids required' });

  const bearerDirect = process.env.X_BEARER_TOKEN;
  const key = process.env.X_API_KEY;
  const secret = process.env.X_API_SECRET;
  if (!bearerDirect && (!key || !secret)) return res.status(500).json({ error: 'X API creds not configured' });

  try {
    let access_token = bearerDirect;

    // Fall back to OAuth2 client_credentials if no direct bearer token
    if (!access_token && key && secret) {
      const basicAuth = Buffer.from(`${key}:${secret}`).toString('base64');
      const authResp = await fetch('https://api.twitter.com/oauth2/token', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      });
      const authBody = await authResp.json();
      access_token = authBody.access_token;
      if (!access_token) {
        return res.status(500).json({ error: 'auth failed', authStatus: authResp.status, authBody });
      }
    }

    // Fetch tweets
    const params = new URLSearchParams({
      ids,
      'tweet.fields': 'text,public_metrics,created_at,author_id',
      expansions: 'author_id',
      'user.fields': 'name,username,profile_image_url',
    });

    const tweetResp = await fetch(`https://api.twitter.com/2/tweets?${params}`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const data = await tweetResp.json();

    if (data.errors && !data.data) {
      return res.status(500).json({ error: 'X API error', details: data.errors });
    }

    // Index users
    const users = Object.fromEntries(
      (data.includes?.users || []).map(u => [u.id, u])
    );

    // Build flat result map keyed by tweet ID
    const result = {};
    for (const t of (data.data || [])) {
      const u = users[t.author_id] || {};
      const m = t.public_metrics || {};
      result[t.id] = {
        id: t.id,
        text: t.text,
        author_name: u.name || '',
        author_handle: u.username || '',
        avatar: u.profile_image_url || '',
        likes: m.like_count || 0,
        retweets: m.retweet_count || 0,
        impressions: m.impression_count || 0,
        replies: m.reply_count || 0,
        created_at: t.created_at || '',
      };
    }

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message, stack: err.stack?.split('\n').slice(0,3) });
  }
}
