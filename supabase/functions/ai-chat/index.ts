import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { MongoClient } from "https://deno.land/x/mongo@v0.32.0/mod.ts";

// Helper function to encode special characters in MongoDB URI password
function encodeMongoUri(uri: string): string {
  const regex = /^(mongodb(?:\+srv)?:\/\/)([^:]+):([^@]+)@(.+)$/;
  const match = uri.match(regex);
  
  if (!match) {
    return uri;
  }
  
  const [, protocol, username, password, rest] = match;
  const encodedUsername = encodeURIComponent(username);
  const encodedPassword = encodeURIComponent(password);
  
  return `${protocol}${encodedUsername}:${encodedPassword}@${rest}`;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Use Lovable AI Gateway 
const AI_GATEWAY_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ticker, messages } = await req.json();
    
    if (!ticker || typeof ticker !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Ticker is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const normalizedTicker = ticker.trim().toUpperCase();
    console.log(`AI Chat for ticker: ${normalizedTicker}`);

    // Fetch screening data for context
    const mongoUri = Deno.env.get('MONGODB_URI');
    if (!mongoUri) {
      throw new Error('MongoDB URI not configured');
    }

    const client = new MongoClient();
    await client.connect(encodeMongoUri(mongoUri));
    const db = client.database('shariah_screening');

    const [invesenseResult, autoBannedPass, autoBannedFail, numericPass, numericFail, masterSheet] = await Promise.all([
      db.collection('client_facing_results').findOne({ Ticker: normalizedTicker }),
      db.collection('Auto-banned-Pass').findOne({ Ticker: normalizedTicker }),
      db.collection('Auto-banned-Fail').findOne({ Ticker: normalizedTicker }),
      db.collection('numeric_pass').findOne({ Ticker: normalizedTicker }),
      db.collection('numeric_fail').findOne({ Ticker: normalizedTicker }),
      db.collection('Master-Sheet').findOne({ Ticker: normalizedTicker }),
    ]);

    await client.close();

    // Build context for AI
    const hasAnyData = invesenseResult || autoBannedPass || autoBannedFail || numericPass || numericFail || masterSheet;
    
    if (!hasAnyData) {
      return new Response(
        JSON.stringify({
          reply: {
            role: 'assistant',
            content: `I don't have any screening data for ${normalizedTicker} yet. This ticker hasn't been analyzed. Would you like to submit a screening request for it?`,
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build screening context
    const screeningContext = `
You are an expert Shariah compliance advisor. Here is the screening data for ${normalizedTicker}:

**Company:** ${invesenseResult?.Company || masterSheet?.Company || 'Unknown'}
**Sector:** ${masterSheet?.Sector || 'Unknown'}
**Industry:** ${masterSheet?.Industry || autoBannedPass?.Industry || autoBannedFail?.Industry || 'Unknown'}

## Invesense Methodology
${invesenseResult ? `
- Classification: ${invesenseResult.final_classification}
- Debt Ratio: ${invesenseResult.Debt_Ratio?.toFixed(2)}% (threshold: 33%)
- Cash+Investments Ratio: ${invesenseResult.CashInv_Ratio?.toFixed(2)}% (threshold: 33%)
- NPIN Ratio: ${invesenseResult.NPIN_Ratio?.toFixed(2)}% (threshold: 5%)
- Purification Required: ${invesenseResult.purification_required ? 'Yes' : 'No'}
${invesenseResult.purification_pct_recommended ? `- Recommended Purification: ${invesenseResult.purification_pct_recommended?.toFixed(2)}%` : ''}
${invesenseResult.shariah_summary ? `- Summary: ${invesenseResult.shariah_summary}` : ''}
${invesenseResult.key_drivers?.length ? `- Key Drivers: ${invesenseResult.key_drivers.join(', ')}` : ''}
` : 'No Invesense screening data available.'}

## Auto-banned Methodology
${autoBannedPass ? `
- Status: PASS (not auto-banned)
- Industry: ${autoBannedPass.Industry || 'N/A'}
- Security Type: ${autoBannedPass.Security_Type || 'N/A'}
` : autoBannedFail ? `
- Status: FAIL (auto-banned)
- Reason: ${autoBannedFail.auto_banned_reason || 'N/A'}
- Industry: ${autoBannedFail.Industry || 'N/A'}
- Security Type: ${autoBannedFail.Security_Type || 'N/A'}
` : 'No Auto-banned screening data available.'}

## Numeric Methodology
${numericPass ? `
- Status: PASS
- Debt Ratio: ${numericPass.Debt_Ratio?.toFixed(2)}%
- Cash+Investments Ratio: ${numericPass.CashInv_Ratio?.toFixed(2)}%
- NPIN Ratio: ${numericPass.NPIN_Ratio?.toFixed(2)}%
` : numericFail ? `
- Status: FAIL
- Fail Reason: ${numericFail.numeric_fail_reason || 'N/A'}
- Debt Ratio: ${numericFail.Debt_Ratio?.toFixed(2)}%
- Cash+Investments Ratio: ${numericFail.CashInv_Ratio?.toFixed(2)}%
- NPIN Ratio: ${numericFail.NPIN_Ratio?.toFixed(2)}%
` : 'No Numeric screening data available.'}

Guidelines:
- Explain concepts clearly for non-experts
- Reference specific ratios and thresholds when relevant
- Explain what purification means and how to calculate it if asked
- Be helpful but note you are not providing religious rulings - consult a scholar for that
`;

    // Call AI Gateway
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('Lovable API key not configured');
    }

    const aiResponse = await fetch(AI_GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: screeningContext },
          ...messages,
        ],
        max_tokens: 1000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', errorText);
      throw new Error('Failed to get AI response');
    }

    const aiData = await aiResponse.json();
    const assistantMessage = aiData.choices?.[0]?.message?.content || 'I apologize, but I was unable to generate a response. Please try again.';

    console.log(`AI Chat response generated for ${normalizedTicker}`);

    return new Response(
      JSON.stringify({
        reply: {
          role: 'assistant',
          content: assistantMessage,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('AI Chat error:', error);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
