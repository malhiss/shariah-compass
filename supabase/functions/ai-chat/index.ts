import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { findByTicker } from "../_shared/sample-data.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Use Lovable AI Gateway 
const AI_GATEWAY_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions';

// Input validation
const TICKER_REGEX = /^[A-Z0-9.]{1,20}$/;
const MAX_MESSAGE_LENGTH = 4000;
const MAX_MESSAGES = 50;

function validateTicker(ticker: string): boolean {
  if (typeof ticker !== 'string') return false;
  const normalized = ticker.trim().toUpperCase();
  return normalized.length >= 1 && normalized.length <= 20 && TICKER_REGEX.test(normalized);
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

function validateMessages(messages: unknown): messages is ChatMessage[] {
  if (!Array.isArray(messages)) return false;
  if (messages.length === 0 || messages.length > MAX_MESSAGES) return false;
  
  return messages.every(msg => {
    if (typeof msg !== 'object' || msg === null) return false;
    const m = msg as Record<string, unknown>;
    if (typeof m.role !== 'string' || !['user', 'assistant', 'system'].includes(m.role)) return false;
    if (typeof m.content !== 'string' || m.content.length === 0 || m.content.length > MAX_MESSAGE_LENGTH) return false;
    return true;
  });
}

function sanitizeMessages(messages: ChatMessage[]): ChatMessage[] {
  return messages.map(msg => ({
    role: msg.role,
    content: msg.content.substring(0, MAX_MESSAGE_LENGTH),
  }));
}

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
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { ticker, messages } = body;
    
    // Validate ticker
    if (!ticker || !validateTicker(ticker)) {
      return new Response(
        JSON.stringify({ error: 'Invalid ticker format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate messages
    if (!validateMessages(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid messages format. Each message must have role and content (max 4000 chars). Maximum 50 messages allowed.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const normalizedTicker = ticker.trim().toUpperCase();
    const sanitizedMessages = sanitizeMessages(messages);

    // Find the record in sample data (async now)
    const record = await findByTicker(normalizedTicker);
    
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

    // Safe number formatting helper
    const formatNum = (val: number | null | undefined, decimals = 2): string => {
      if (val === null || val === undefined) return 'N/A';
      return val.toFixed(decimals);
    };

    // Build screening context
    const screeningContext = `
You are an expert Shariah compliance advisor. Here is the screening data for ${normalizedTicker}:

**Company:** ${record.company_name}
**Industry:** ${record.industry}
**Report Date:** ${record.report_date}

## Overall Status
- Final Classification: ${record.final_classification}
- Purification Required: ${record.purification_required ? 'Yes' : 'No'}
${record.purification_pct_recommended ? `- Recommended Purification: ${formatNum(record.purification_pct_recommended)}%` : ''}
- Board Review Needed: ${record.needs_board_review ? 'Yes' : 'No'}

## Financial Ratios (Numeric Screening)
- Debt Ratio: ${formatNum(record.debt_ratio_pct)}% (threshold: ${record.debt_threshold_pct || 33}%) - ${record.debt_status || 'N/A'}
- Cash+Investments Ratio: ${formatNum(record.cash_inv_ratio_pct)}% (threshold: ${record.cash_inv_threshold_pct || 33}%) - ${record.cash_inv_status || 'N/A'}
- NPIN Ratio: ${formatNum(record.npin_ratio_pct)}% (threshold: ${record.npin_threshold_pct || 5}%) - ${record.npin_status || 'N/A'}
- Numeric Screening Result: ${numericPass ? 'PASS' : 'FAIL'}

## Auto-Banned Status
- Auto-banned: ${record.auto_banned ? 'Yes' : 'No'}
${record.auto_banned_reason_clean ? `- Reason: ${record.auto_banned_reason_clean}` : ''}
${record.auto_banned_summary ? `- Summary: ${record.auto_banned_summary}` : ''}

## Business Status
- Business Status: ${record.business_status}
${record.llm_has_fail_flag ? '- LLM Fail Flag: Yes' : ''}
${record.llm_has_caution_flag ? '- LLM Caution Flag: Yes' : ''}
${record.llm_primary_rationale ? `- LLM Rationale: ${record.llm_primary_rationale}` : ''}
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
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
          ...sanitizedMessages,
        ],
        max_tokens: 1000,
      }),
    });

    if (!aiResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'AI service temporarily unavailable' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const assistantMessage = aiData.choices?.[0]?.message?.content || 'I apologize, but I was unable to generate a response. Please try again.';

    return new Response(
      JSON.stringify({
        reply: {
          role: 'assistant',
          content: assistantMessage,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch {
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
