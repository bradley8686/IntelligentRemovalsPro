# Smart Scan Backend

The phone app has a **Smart Scan** button. It captures one compressed camera frame and sends it to a backend vision API. The API key must live on the backend, never in the browser app.

## Cheapest Recommended Setup

Use Cloudflare Workers.

## Deploy

Install Wrangler:

```bash
npm install -g wrangler
```

Login:

```bash
wrangler login
```

Set your OpenAI key:

```bash
wrangler secret put OPENAI_API_KEY
```

Deploy:

```bash
wrangler deploy
```

Wrangler will print a Worker URL similar to:

```text
https://intelligent-removals-smart-scan.<your-account>.workers.dev
```

Put that URL into:

```text
smart-scan-config.json
```

Example:

```json
{
  "endpoint": "https://intelligent-removals-smart-scan.<your-account>.workers.dev"
}
```

Commit and push the config, or paste the endpoint into the phone app's **API Setup** button.

## Cost Control

The app sends one compressed image only when the user taps **Smart Scan**. It does not stream video. The backend asks OpenAI vision with `detail: "low"` to reduce image token cost.

## API Used

The worker uses OpenAI's Responses API with an image input data URL.
