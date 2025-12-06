import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { MongoClient } from "https://deno.land/x/mongo@v0.32.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ticker } = await req.json();
    
    if (!ticker || typeof ticker !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Ticker is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const normalizedTicker = ticker.trim().toUpperCase();
    console.log(`Screening ticker: ${normalizedTicker}`);

    const mongoUri = Deno.env.get('MONGODB_URI');
    if (!mongoUri) {
      throw new Error('MongoDB URI not configured');
    }

    const client = new MongoClient();
    await client.connect(mongoUri);
    
    const db = client.database('shariah_screening');

    // Query all three methodologies in parallel
    const [invesenseResult, autoBannedPass, autoBannedFail, numericPass, numericFail, masterSheet] = await Promise.all([
      db.collection('client_facing_results').findOne({ Ticker: normalizedTicker }),
      db.collection('Auto-banned-Pass').findOne({ Ticker: normalizedTicker }),
      db.collection('Auto-banned-Fail').findOne({ Ticker: normalizedTicker }),
      db.collection('numeric_pass').findOne({ Ticker: normalizedTicker }),
      db.collection('numeric_fail').findOne({ Ticker: normalizedTicker }),
      db.collection('Master-Sheet').findOne({ Ticker: normalizedTicker }),
    ]);

    // Also check for QA issues
    const qaResult = await db.collection('client_facing_qa').findOne({ Ticker: normalizedTicker });

    await client.close();

    // Build response
    const response = {
      security: {
        ticker: normalizedTicker,
        company: invesenseResult?.Company || masterSheet?.Company || autoBannedPass?.Company || autoBannedFail?.Company || null,
        sector: masterSheet?.Sector || null,
        industry: masterSheet?.Industry || autoBannedPass?.Industry || autoBannedFail?.Industry || null,
        typeOfSecurity: masterSheet?.typeOfSecurity || autoBannedPass?.Security_Type || autoBannedFail?.Security_Type || null,
        reportDate: masterSheet?.report_date || null,
      },
      invesense: {
        classification: invesenseResult?.final_classification || null,
        debtRatio: invesenseResult?.Debt_Ratio ?? null,
        cashInvRatio: invesenseResult?.CashInv_Ratio ?? null,
        npinRatio: invesenseResult?.NPIN_Ratio ?? null,
        purificationRequired: invesenseResult?.purification_required === true || invesenseResult?.purification_required === 'true',
        purificationPctRecommended: invesenseResult?.purification_pct_recommended ?? null,
        keyDrivers: invesenseResult?.key_drivers || [],
        shariahSummary: invesenseResult?.shariah_summary || null,
        notesForPortfolioManager: invesenseResult?.notes_for_portfolio_manager || null,
        needsBoardReview: invesenseResult?.needs_board_review === true,
        haramRevenuePercent: invesenseResult?.haram_revenue_percent ?? null,
        qaStatus: qaResult?.qa_status || null,
        qaIssues: qaResult?.qa_issues || [],
        available: !!invesenseResult,
      },
      autoBanned: {
        status: autoBannedPass ? 'PASS' : autoBannedFail ? 'FAIL' : null,
        autoBanned: autoBannedFail?.auto_banned === true || autoBannedFail?.auto_banned === 'true',
        autoBannedReason: autoBannedFail?.auto_banned_reason || null,
        industry: autoBannedPass?.Industry || autoBannedFail?.Industry || null,
        securityType: autoBannedPass?.Security_Type || autoBannedFail?.Security_Type || null,
        available: !!(autoBannedPass || autoBannedFail),
      },
      numeric: {
        status: numericPass ? 'PASS' : numericFail ? 'FAIL' : null,
        debtRatio: numericPass?.Debt_Ratio ?? numericFail?.Debt_Ratio ?? null,
        cashInvRatio: numericPass?.CashInv_Ratio ?? numericFail?.CashInv_Ratio ?? null,
        npinRatio: numericPass?.NPIN_Ratio ?? numericFail?.NPIN_Ratio ?? null,
        failReason: numericFail?.numeric_fail_reason || null,
        available: !!(numericPass || numericFail),
      },
    };

    console.log(`Screening complete for ${normalizedTicker}:`, {
      invesense: response.invesense.available,
      autoBanned: response.autoBanned.available,
      numeric: response.numeric.available,
    });

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Ticker screening error:', error);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
