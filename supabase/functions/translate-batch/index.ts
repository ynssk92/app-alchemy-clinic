// Edge function: translate an array of strings between fr/en using Lovable AI Gateway.
// Public (no JWT required) — read-only translation service.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Req {
  texts: string[];
  from: "fr" | "en";
  to: "fr" | "en";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { texts, from, to } = (await req.json()) as Req;
    if (!Array.isArray(texts) || texts.length === 0 || from === to) {
      return new Response(JSON.stringify({ translations: texts ?? [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing LOVABLE_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const langName = (c: string) => (c === "fr" ? "French" : "English");
    const system = `You are a professional translator for a dental clinic web app. Translate every item from ${langName(from)} to ${langName(to)}. Preserve punctuation, numbers, emojis, and casing style. Do NOT translate: brand names (La Dune, HealthBook), proper nouns of people, email addresses, URLs, or code-like tokens. Return ONLY a JSON object shaped as {"translations": string[]} with exactly the same number of items, in the same order.`;

    const user = JSON.stringify({ items: texts });

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      // If we are out of credits or the gateway is down, return the original texts with a 200 OK.
      // This prevents noisy errors in the console and allows the app to function normally.
      const errText = await res.text();
      let isCreditError = false;
      try {
        const errJson = JSON.parse(errText);
        isCreditError = res.status === 402 || errJson.error === "payment_required" || (errJson.detail && errJson.detail.includes("credits"));
      } catch {
        isCreditError = res.status === 402;
      }

      console.warn(`Translation gateway error (${res.status}):`, errText);
      
      return new Response(JSON.stringify({ 
        translations: texts, 
        status: "fallback",
        reason: isCreditError ? "out_of_credits" : "gateway_error",
        detail: errText
      }), {
        status: 200, // Return 200 to be silent in the frontend
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content ?? "{}";
    let parsed: { translations?: string[] } = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = {};
    }
    const translations = Array.isArray(parsed.translations) && parsed.translations.length === texts.length
      ? parsed.translations
      : texts;

    return new Response(JSON.stringify({ translations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
