import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, targetLanguage } = await req.json();
    
    // Input validation
    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: "Invalid text parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (text.length > 5000) {
      return new Response(
        JSON.stringify({ error: "Text too long (max 5000 characters)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const validLanguages = ['en', 'es', 'fr', 'de', 'ja', 'ko', 'zh', 'ar', 'ru', 'pt', 'hi'];
    if (!validLanguages.includes(targetLanguage?.toLowerCase())) {
      return new Response(
        JSON.stringify({ error: "Invalid target language" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // First, detect the language of the text
    const detectResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a language detector. Respond with only the 2-letter ISO language code (e.g., 'en', 'es', 'ko', 'ja') of the given text. Nothing else."
          },
          {
            role: "user",
            content: text
          }
        ]
      }),
    });

    if (!detectResponse.ok) {
      console.error("Language detection failed:", await detectResponse.text());
      return new Response(
        JSON.stringify({ needsTranslation: false, originalText: text }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const detectData = await detectResponse.json();
    const detectedLanguage = detectData.choices[0].message.content.trim().toLowerCase();
    
    console.log("Detected language:", detectedLanguage, "Target:", targetLanguage);

    // If same language, no translation needed
    if (detectedLanguage === targetLanguage.toLowerCase()) {
      return new Response(
        JSON.stringify({ 
          needsTranslation: false, 
          originalText: text,
          detectedLanguage 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Translate the text
    const translateResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a professional translator. Translate the given text to ${targetLanguage}. Respond with ONLY the translated text, nothing else. Maintain the tone and style of the original message.`
          },
          {
            role: "user",
            content: text
          }
        ]
      }),
    });

    if (!translateResponse.ok) {
      console.error("Translation failed:", await translateResponse.text());
      return new Response(
        JSON.stringify({ needsTranslation: false, originalText: text }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const translateData = await translateResponse.json();
    const translatedText = translateData.choices[0].message.content.trim();

    return new Response(
      JSON.stringify({ 
        needsTranslation: true,
        originalText: text,
        translatedText,
        detectedLanguage
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Translation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
