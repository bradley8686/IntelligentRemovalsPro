const ALLOWED_ORIGINS = [
  'https://bradley8686.github.io',
  'https://bradley8686.github.io/IntelligentRemovalsPro'
];

const DEFAULT_LABELS = [
  'sofa',
  'armchair',
  'dining_table',
  'chair',
  'double_bed',
  'wardrobe',
  'chest_of_drawers',
  'fridge',
  'washing_machine',
  'tv',
  'boxes',
  'suitcase',
  'bicycle',
  'plant',
  'microwave',
  'laptop',
  'lamp',
  'mirror'
];

function corsHeaders(origin) {
  const allowed = origin && ALLOWED_ORIGINS.some((allowedOrigin) => origin.startsWith(allowedOrigin));
  return {
    'Access-Control-Allow-Origin': allowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
}

function json(data, status = 200, origin = '') {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(origin)
    }
  });
}

function parseJsonFromText(text) {
  const trimmed = String(text || '').trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Vision model did not return JSON');
    return JSON.parse(match[0]);
  }
}

function sanitizeItems(items, labels) {
  const allowed = new Set(labels);
  return (Array.isArray(items) ? items : [])
    .map((item) => ({
      label: String(item.label || '').trim(),
      qty: Math.max(1, Math.min(20, Number(item.qty) || 1)),
      confidence: Math.max(0, Math.min(1, Number(item.confidence) || 0.7)),
      reason: String(item.reason || '').slice(0, 180)
    }))
    .filter((item) => allowed.has(item.label))
    .slice(0, 12);
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(origin) });
    }

    if (request.method !== 'POST') {
      return json({ error: 'Use POST' }, 405, origin);
    }

    if (!env.OPENAI_API_KEY) {
      return json({ error: 'OPENAI_API_KEY is not configured on the worker' }, 500, origin);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid JSON body' }, 400, origin);
    }

    const image = String(body.image || '');
    if (!image.startsWith('data:image/')) {
      return json({ error: 'Missing image data URL' }, 400, origin);
    }

    const labels = Array.isArray(body.labels) && body.labels.length ? body.labels : DEFAULT_LABELS;
    const prompt = [
      'You are a removals survey assistant.',
      'Look at this single room photo and identify visible removals inventory items.',
      `Only use these label keys: ${labels.join(', ')}.`,
      'Return strict JSON only in this shape:',
      '{"items":[{"label":"sofa","qty":1,"confidence":0.87,"reason":"visible couch"}],"notes":"short note"}',
      'Count conservatively. If unsure, omit the item. Do not invent hidden items.'
    ].join('\n');

    const openAiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: env.OPENAI_MODEL || 'gpt-4.1-mini',
        input: [{
          role: 'user',
          content: [
            { type: 'input_text', text: prompt },
            { type: 'input_image', image_url: image, detail: 'low' }
          ]
        }]
      })
    });

    const result = await openAiResponse.json();
    if (!openAiResponse.ok) {
      return json({ error: result.error?.message || 'OpenAI vision request failed' }, 502, origin);
    }

    let parsed;
    try {
      parsed = parseJsonFromText(result.output_text);
    } catch (error) {
      return json({ error: error.message, raw: result.output_text || '' }, 502, origin);
    }

    return json({
      items: sanitizeItems(parsed.items, labels),
      notes: String(parsed.notes || '').slice(0, 300)
    }, 200, origin);
  }
};
