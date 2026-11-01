export default async function handler(req, res) {
  const targetUrl = req.query.url;
  const channelType = req.query.type || 'default';

  if (!targetUrl) {
    return res.status(400).send('Missing url parameter');
  }

  try {
    let headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };

    if (channelType === 'jiotv') {
      headers['Referer'] = 'https://jiotv.com/';
      headers['Origin'] = 'https://jiotv.com';
      // Yadi cookie query parameter re asuchhi ki request re thiba, taaku handle kariba
      if (req.headers.cookie) {
        headers['Cookie'] = req.headers.cookie;
      }
    }

    const response = await fetch(targetUrl, { headers });

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    // Content type set kariba MPD ba video segments pain
    if (targetUrl.endsWith('.mpd')) {
      res.setHeader('Content-Type', 'application/dash+xml');
    } else {
      res.setHeader('Content-Type', response.headers.get('content-type') || 'video/mp2t');
    }

    const buffer = await response.arrayBuffer();
    return res.status(200).send(Buffer.from(buffer));
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch stream', details: error.message });
  }
}

