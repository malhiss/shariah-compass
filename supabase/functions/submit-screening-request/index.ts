import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { MongoClient, ObjectId } from "https://deno.land/x/mongo@v0.32.0/mod.ts";

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ticker, exchange, isin, email, methodology, useCase } = await req.json();
    
    if (!ticker || typeof ticker !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Ticker is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const normalizedTicker = ticker.trim().toUpperCase();
    console.log(`Submitting screening request for: ${normalizedTicker}`);

    const mongoUri = Deno.env.get('MONGODB_URI');
    if (!mongoUri) {
      throw new Error('MongoDB URI not configured');
    }

    const client = new MongoClient();
    await client.connect(encodeMongoUri(mongoUri));
    const db = client.database('shariah_screening');

    // Check if request already exists
    const existingRequest = await db.collection('screening_requests').findOne({
      Ticker: normalizedTicker,
      status: { $in: ['PENDING', 'IN_PROGRESS'] },
    });

    if (existingRequest) {
      await client.close();
      return new Response(
        JSON.stringify({
          success: true,
          id: existingRequest._id.toString(),
          status: existingRequest.status,
          message: 'Request already exists for this ticker',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert new request
    const newRequest = {
      Ticker: normalizedTicker,
      exchange: exchange || null,
      isin: isin || null,
      email: email || null,
      methodology: methodology || 'invesense',
      useCase: useCase || null,
      status: 'PENDING',
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await db.collection('screening_requests').insertOne(newRequest);
    await client.close();

    console.log(`Screening request created: ${result.toString()}`);

    return new Response(
      JSON.stringify({
        success: true,
        id: result.toString(),
        status: 'PENDING',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Screening request error:', error);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
