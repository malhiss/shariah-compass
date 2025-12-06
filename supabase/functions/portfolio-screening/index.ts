import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { MongoClient } from "https://deno.land/x/mongo@v0.32.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Holding {
  ticker: string;
  quantity: number;
  price: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { holdings } = await req.json();
    
    if (!holdings || !Array.isArray(holdings) || holdings.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Holdings array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Screening portfolio with ${holdings.length} holdings`);

    const mongoUri = Deno.env.get('MONGODB_URI');
    if (!mongoUri) {
      throw new Error('MongoDB URI not configured');
    }

    const client = new MongoClient();
    await client.connect(mongoUri);
    const db = client.database('shariah_screening');

    // Get all unique tickers
    const tickers = holdings.map((h: Holding) => h.ticker.trim().toUpperCase());
    
    // Query all collections
    const [invesenseResults, autoBannedPassResults, autoBannedFailResults, numericPassResults, numericFailResults, masterSheets] = await Promise.all([
      db.collection('client_facing_results').find({ Ticker: { $in: tickers } }).toArray(),
      db.collection('Auto-banned-Pass').find({ Ticker: { $in: tickers } }).toArray(),
      db.collection('Auto-banned-Fail').find({ Ticker: { $in: tickers } }).toArray(),
      db.collection('numeric_pass').find({ Ticker: { $in: tickers } }).toArray(),
      db.collection('numeric_fail').find({ Ticker: { $in: tickers } }).toArray(),
      db.collection('Master-Sheet').find({ Ticker: { $in: tickers } }).toArray(),
    ]);

    await client.close();

    // Create lookup maps
    const invesenseMap = new Map(invesenseResults.map(r => [r.Ticker, r]));
    const autoBannedPassMap = new Map(autoBannedPassResults.map(r => [r.Ticker, r]));
    const autoBannedFailMap = new Map(autoBannedFailResults.map(r => [r.Ticker, r]));
    const numericPassMap = new Map(numericPassResults.map(r => [r.Ticker, r]));
    const numericFailMap = new Map(numericFailResults.map(r => [r.Ticker, r]));
    const masterMap = new Map(masterSheets.map(r => [r.Ticker, r]));

    // Calculate total portfolio value
    let totalValue = 0;
    const holdingResults = holdings.map((h: Holding) => {
      const ticker = h.ticker.trim().toUpperCase();
      const value = h.quantity * h.price;
      totalValue += value;

      const invesense = invesenseMap.get(ticker);
      const autoBannedPass = autoBannedPassMap.get(ticker);
      const autoBannedFail = autoBannedFailMap.get(ticker);
      const numericPass = numericPassMap.get(ticker);
      const numericFail = numericFailMap.get(ticker);
      const master = masterMap.get(ticker);

      return {
        ticker,
        quantity: h.quantity,
        price: h.price,
        value,
        company: invesense?.Company || master?.Company || autoBannedPass?.Company || autoBannedFail?.Company || null,
        invesense: {
          classification: invesense?.final_classification || null,
          debtRatio: invesense?.Debt_Ratio ?? null,
          cashInvRatio: invesense?.CashInv_Ratio ?? null,
          npinRatio: invesense?.NPIN_Ratio ?? null,
          purificationRequired: invesense?.purification_required === true,
          purificationPctRecommended: invesense?.purification_pct_recommended ?? null,
          keyDrivers: [],
          shariahSummary: null,
          notesForPortfolioManager: null,
          needsBoardReview: false,
          haramRevenuePercent: null,
          qaStatus: null,
          qaIssues: [],
          available: !!invesense,
        },
        autoBanned: {
          status: autoBannedPass ? 'PASS' : autoBannedFail ? 'FAIL' : null,
          autoBanned: autoBannedFail?.auto_banned === true,
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
    });

    // Calculate summaries
    const createSummary = (getClassification: (h: any) => string | null, getAvailable: (h: any) => boolean) => {
      let compliant = 0, purification = 0, nonCompliant = 0, noData = 0;
      
      holdingResults.forEach(h => {
        if (!getAvailable(h)) {
          noData += h.value;
        } else {
          const cls = getClassification(h);
          if (cls === 'COMPLIANT' || cls === 'PASS') {
            compliant += h.value;
          } else if (cls === 'COMPLIANT_WITH_PURIFICATION') {
            purification += h.value;
          } else {
            nonCompliant += h.value;
          }
        }
      });

      return {
        compliantWeight: compliant,
        compliantWithPurificationWeight: purification,
        nonCompliantWeight: nonCompliant,
        noDataWeight: noData,
        totalValue,
      };
    };

    const response = {
      summary: {
        invesense: createSummary(h => h.invesense.classification, h => h.invesense.available),
        autoBanned: createSummary(h => h.autoBanned.status, h => h.autoBanned.available),
        numeric: createSummary(h => h.numeric.status, h => h.numeric.available),
      },
      holdings: holdingResults,
      totalValue,
    };

    console.log(`Portfolio screening complete. Total value: ${totalValue}`);

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Portfolio screening error:', error);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
