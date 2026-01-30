// Shared CORS configuration with origin restriction
// Only allows requests from known domains

const ALLOWED_ORIGINS = [
  'https://dalilplatform.lovable.app',
  'https://dalil.me',
  'https://www.dalil.me',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
];

// For preview URLs (Lovable generates dynamic preview URLs)
// Matches both formats: 
// - id-preview--uuid.lovable.app
// - uuid.lovableproject.com
const PREVIEW_URL_PATTERNS = [
  /^https:\/\/[a-z0-9-]+--[a-z0-9-]+\.lovable\.app$/,
  /^https:\/\/[a-z0-9-]+\.lovableproject\.com$/,
];

export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') || '';
  
  // Check if origin is in allowed list or matches preview patterns
  const isAllowed = ALLOWED_ORIGINS.includes(origin) || 
    PREVIEW_URL_PATTERNS.some(pattern => pattern.test(origin));
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
    'Access-Control-Allow-Credentials': 'true',
  };
}

// Helper to handle OPTIONS preflight
export function handleCorsOptions(req: Request): Response {
  return new Response(null, { headers: getCorsHeaders(req) });
}
