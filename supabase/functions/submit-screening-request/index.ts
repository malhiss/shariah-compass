import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { MongoClient } from "https://deno.land/x/mongo@v0.32.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

// Input validation
const TICKER_REGEX = /^[A-Z0-9.]{1,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_METHODOLOGIES = ['invesense', 'aaoifi', 'custom'];

function validateTicker(ticker: string): boolean {
  if (typeof ticker !== 'string') return false;
  const normalized = ticker.trim().toUpperCase();
  return normalized.length >= 1 && normalized.length <= 20 && TICKER_REGEX.test(normalized);
}

function validateEmail(email: string): boolean {
  return typeof email === 'string' && 
         email.length <= 254 && 
         EMAIL_REGEX.test(email.trim());
}

function sanitizeString(str: string, maxLength: number): string {
  if (typeof str !== 'string') return '';
  return str.trim().substring(0, maxLength);
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
    // Verify authentication
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

    const { ticker, exchange, isin, email, methodology, useCase } = body;
    
    // Validate ticker
    if (!ticker || !validateTicker(ticker)) {
      return new Response(
        JSON.stringify({ error: 'Invalid ticker format. Must be 1-20 alphanumeric characters.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email if provided
    if (email && !validateEmail(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate methodology if provided
    const safeMethodology = methodology && typeof methodology === 'string' 
      ? (VALID_METHODOLOGIES.includes(methodology.toLowerCase()) ? methodology.toLowerCase() : 'invesense')
      : 'invesense';

    const normalizedTicker = ticker.trim().toUpperCase();

    const mongoUri = Deno.env.get('MONGODB_URI');
    if (!mongoUri) {
      return new Response(
        JSON.stringify({ error: 'Service configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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

    // Insert new request with sanitized inputs
    const newRequest = {
      Ticker: normalizedTicker,
      exchange: exchange ? sanitizeString(exchange, 50) : null,
      isin: isin ? sanitizeString(isin, 20) : null,
      email: email ? email.trim().toLowerCase().substring(0, 254) : authUser.email,
      methodology: safeMethodology,
      useCase: useCase ? sanitizeString(useCase, 500) : null,
      status: 'PENDING',
      submitted_by: authUser.userId,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await db.collection('screening_requests').insertOne(newRequest);
    await client.close();

    return new Response(
      JSON.stringify({
        success: true,
        id: result.toString(),
        status: 'PENDING',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch {
    return new Response(
      JSON.stringify({ error: 'Failed to submit screening request. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
