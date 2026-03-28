/**
 * Netlify Function: chat
 * Primary: OpenRouter (OpenAI-compatible SDK) — https://openrouter.ai/api/v1
 * Fallbacks: Hugging Face chatCompletion, then direct OpenAI.
 */

const SYSTEM_WHO_CDC = `You are a careful health information assistant.

Rules:
- Give general education only. Do NOT diagnose, prescribe medication, or replace a clinician.
- Align your guidance with the kind of public, non-clinical information typically published by the World Health Organization (WHO) and the U.S. Centers for Disease Control and Prevention (CDC) for the general public.
- Do not invent specific citations, page numbers, or claim you retrieved a particular document unless you are certain.
- Answer in clear English only. No markdown headings or bullet symbols; use short numbered lines if needed.
- If the user needs personal decisions, tell them to check official WHO (who.int) and CDC (cdc.gov) and see a licensed health professional.

Output format:
1) Brief possible explanations (non-diagnostic, high level)
2) Self-care and monitoring that are commonly mentioned in public health education
3) When to contact a clinician
4) When to seek emergency care`;

const USER_PROMPT = (message) =>
  `The user describes: "${message}"\n\nRespond following the system rules.`;

async function replyFromOpenRouter(message) {
  const { default: OpenAI } = await import("openai");

  const client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
      "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "https://localhost",
      "X-Title": process.env.OPENROUTER_APP_TITLE || "Healthcare Assistant"
    }
  });

  const model =
    process.env.OPENROUTER_MODEL || "nvidia/nemotron-3-super-120b-a12b:free";

  const messages = [
    { role: "system", content: SYSTEM_WHO_CDC },
    { role: "user", content: USER_PROMPT(message) }
  ];

  const baseParams = {
    model,
    messages,
    temperature: 0.3,
    max_tokens: 600
  };

  try {
    const apiResponse = await client.chat.completions.create({
      ...baseParams,
      reasoning: { enabled: true }
    });
    return apiResponse.choices[0]?.message?.content?.trim() || "";
  } catch {
    const apiResponse = await client.chat.completions.create(baseParams);
    return apiResponse.choices[0]?.message?.content?.trim() || "";
  }
}

async function replyFromOpenAI(message, apiKey) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.3,
      max_tokens: 600,
      messages: [
        { role: "system", content: SYSTEM_WHO_CDC },
        { role: "user", content: USER_PROMPT(message) }
      ]
    })
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    const err = new Error(data?.error?.message || data?.message || text || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }

  return data?.choices?.[0]?.message?.content?.trim() || "";
}

async function replyFromHuggingFace(message, hfToken) {
  const { InferenceClient } = await import("@huggingface/inference");
  const client = new InferenceClient(hfToken);

  const modelsToTry = [
    "HuggingFaceTB/SmolLM2-135M-Instruct",
    "HuggingFaceTB/SmolLM2-360M-Instruct"
  ];

  let lastErr;
  for (const model of modelsToTry) {
    try {
      const out = await client.chatCompletion({
        model,
        messages: [
          { role: "system", content: SYSTEM_WHO_CDC },
          { role: "user", content: USER_PROMPT(message) }
        ],
        max_tokens: 500,
        temperature: 0.3
      });
      const text = out?.choices?.[0]?.message?.content?.trim();
      if (text) return text;
    } catch (e) {
      lastErr = e;
    }
  }

  throw lastErr || new Error("No Hugging Face model returned a reply");
}

export default async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    body = null;
  }

  const message = body?.message?.trim();
  if (!message) {
    return new Response(JSON.stringify({ error: "Missing message" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const hfToken = process.env.HF_TOKEN;

  if (!openrouterKey && !hfToken && !openaiKey) {
    return new Response(
      JSON.stringify({
        error:
          "Server misconfigured. Set OPENROUTER_API_KEY (recommended), or HF_TOKEN, or OPENAI_API_KEY."
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    let reply = "";

    if (openrouterKey) {
      reply = await replyFromOpenRouter(message);
    } else if (hfToken) {
      try {
        reply = await replyFromHuggingFace(message, hfToken);
      } catch (hfErr) {
        if (openaiKey) {
          reply = await replyFromOpenAI(message, openaiKey);
        } else {
          throw hfErr;
        }
      }
    } else {
      reply = await replyFromOpenAI(message, openaiKey);
    }

    if (!reply) {
      return new Response(JSON.stringify({ error: "Empty model response" }), {
        status: 502,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(
      JSON.stringify({
        reply,
        disclaimer: "This chatbot provides informational guidance only."
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    const status = e?.status && e.status >= 400 && e.status < 600 ? e.status : 502;
    return new Response(
      JSON.stringify({
        error: "AI service failed",
        detail: e?.message || String(e)
      }),
      { status, headers: { "Content-Type": "application/json" } }
    );
  }
};
