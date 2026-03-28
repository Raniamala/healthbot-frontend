# Netlify environment variables

Set these in **Site settings → Environment variables** (then redeploy).

## Recommended: OpenRouter

| Variable | Required | Purpose |
|----------|----------|---------|
| `OPENROUTER_API_KEY` | **Yes** (for OpenRouter) | API key from [OpenRouter](https://openrouter.ai/). |
| `OPENROUTER_MODEL` | No | Defaults to `nvidia/nemotron-3-super-120b-a12b:free`. |
| `OPENROUTER_SITE_URL` | No | Sent as `HTTP-Referer` (defaults to `https://localhost`). |
| `OPENROUTER_APP_TITLE` | No | Sent as `X-Title` (defaults to `Healthcare Assistant`). |

The Netlify function uses the **OpenAI-compatible** client with `baseURL: https://openrouter.ai/api/v1` (see `netlify/functions/chat.js`). It tries `reasoning: { enabled: true }` first; if that fails, it retries without.

## Optional fallbacks

| Variable | Purpose |
|----------|---------|
| `HF_TOKEN` | Hugging Face token if OpenRouter is not configured. |
| `OPENAI_API_KEY` | Direct OpenAI API if neither OpenRouter nor HF works. |
| `OPENAI_MODEL` | Defaults to `gpt-4o-mini`. |

**Note:** WHO/CDC alignment is done via the system prompt; this does not retrieve WHO/CDC documents at runtime unless you add RAG separately.
