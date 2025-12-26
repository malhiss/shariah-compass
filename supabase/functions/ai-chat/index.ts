import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { findByTicker } from "../_shared/sample-data.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Use Lovable AI Gateway 
const AI_GATEWAY_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions';

// Helper to verify authenticated user
async function verifyAuth(req: Request): Promise<{ userId: string; email: string | null } | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return null;

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user }, error } = await supabaseClient.auth.getUser();
  if (error || !user) return null;

  return { userId: user.id, email: user.email || null };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authUser = await verifyAuth(req);
    if (!authUser) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
    console.log(`User: ${authUser.email}, AI Chat for ticker: ${normalizedTicker}`);

    // Find the record in sample data
    const record = findByTicker(normalizedTicker);
    
    if (!record) {
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

    // Determine numeric pass/fail
    const numericPass = record.debt_status === "PASS" && 
                        record.cash_inv_status === "PASS" && 
                        record.npin_status === "PASS";

    // Build screening context
    const screeningContext = `
You are an expert Shariah compliance advisor. Here is the screening data for ${normalizedTicker}:

**Company:** ${record.company_name}
**Industry:** ${record.industry}
**Report Date:** ${record.report_date}

## Overall Status
- Final Classification: ${record.final_classification}
- Purification Required: ${record.purification_required ? 'Yes' : 'No'}
${record.purification_pct_recommended ? `- Recommended Purification: ${record.purification_pct_recommended.toFixed(2)}%` : ''}
- Board Review Needed: ${record.needs_board_review ? 'Yes' : 'No'}

## Financial Ratios (Numeric Screening)
- Debt Ratio: ${record.debt_ratio_pct.toFixed(2)}% (threshold: ${record.debt_threshold_pct}%) - ${record.debt_status}
- Cash+Investments Ratio: ${record.cash_inv_ratio_pct.toFixed(2)}% (threshold: ${record.cash_inv_threshold_pct}%) - ${record.cash_inv_status}
- NPIN Ratio: ${record.npin_ratio_pct.toFixed(2)}% (threshold: ${record.npin_threshold_pct}%) - ${record.npin_status}
- Numeric Screening Result: ${numericPass ? 'PASS' : 'FAIL'}

## Auto-Banned Status
- Auto-banned: ${record.auto_banned ? 'Yes' : 'No'}
${record.auto_banned_reason_clean ? `- Reason: ${record.auto_banned_reason_clean}` : ''}
${record.auto_banned_summary ? `- Summary: ${record.auto_banned_summary}` : ''}

## Business Status
- Business Status: ${record.business_status}
${record.doubt_reason ? `- Doubt Reason: ${record.doubt_reason}` : ''}

## Summary
${record.shariah_summary}

${record.notes_for_portfolio_manager ? `## Notes for Portfolio Manager\n${record.notes_for_portfolio_manager}` : ''}

Guidelines for your responses:
- Explain concepts clearly for non-experts
- Reference specific ratios and thresholds when relevant
- Explain what purification means and how to calculate it if asked
- Be helpful but note you are not providing religious rulings - consult a scholar for that
- Keep responses concise but informative
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
