# cf_ai_cloudflare_chatbot

An AI-powered research chatbot built on Cloudflare's developer platform. The agent maintains conversation memory, detects the language of each message, and responds using Llama 3.3 via Workers AI.

## Live Demo

https://cf-ai-research-agent.sohono2005.workers.dev

## Features

- **LLM** — Llama 3.3 (70B) via Cloudflare Workers AI
- **Memory** — Conversation history persisted in a Durable Object's built-in storage
- **Workflow** — Language detection pipeline using Cloudflare Workflows, runs before every response
- **Chat UI** — Simple browser-based chat interface served as a static asset

## How It Works

1. User sends a message via the chat interface
2. The Worker receives the POST request and triggers a **Cloudflare Workflow** to detect the language of the message
3. Once the language is detected, it is shown as a tag next to the user's message
4. The Worker calls the **ResearchAgent Durable Object**, which holds the full conversation history
5. The Durable Object sends the history to **Llama 3.3** and returns the response
6. The response is displayed in the chat

## Architecture

```
Browser → Worker → Workflow (language detection) → Workers AI (Llama 3.3)
                 → Durable Object (memory + chat)  → Workers AI (Llama 3.3)
```

## Components

| Component | Cloudflare Product | Purpose |
|---|---|---|
| `ResearchAgent` | Durable Objects | Conversation memory and LLM calls |
| `LanguageDetectionWorkflow` | Workflows | Multi-step language detection pipeline |
| Chat UI | Workers Assets | Frontend served at `/` |
| Llama 3.3 | Workers AI | Language model |

## Running Locally

**Requirements:** Node.js 18+, a Cloudflare account

**1. Clone the repository**
git clone https://github.com/tiago92nogueira/cf_ai_cloudflare_chatbot
cd cf_ai_cloudflare_chatbot

**2. Install dependencies**
npm install


**3. Login to Cloudflare**
npx wrangler login

**4. Start the local development server**

npm run dev

**5. Open the app**

Go to http://localhost:8787 in your browser.

> Note: Workers AI always runs remotely even in local development, so an internet connection and Cloudflare account are required.

## Deploying to Cloudflare

npm run deploy


The app will be available at `https://cf-ai-research-agent.<your-subdomain>.workers.dev`
