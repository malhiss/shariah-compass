import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getAllRecords, getDistinctValues, findByUpsertKey, loadData, type ScreeningRecord } from "../_shared/sample-data.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const user = await verifyAuth(req);
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, filters } = await req.json();
    console.log("User:", user.email, "Action:", action);

    const result = await handleAction(action, (filters || {}) as Record<string, unknown>);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Shariah dashboard error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function handleAction(action: string, filters: Record<string, unknown>) {
  switch (action) {
    case "getClientFacingRecords": {
      // Get records with filtering and pagination
      const autoBannedFilter = filters.autoBanned === "YES" ? true : 
                               filters.autoBanned === "NO" ? false : undefined;
      
      const { records, total } = await getAllRecords({
        search: filters.search as string,
        finalClassification: filters.finalVerdict as string,
        industry: filters.industry as string,
        autoBanned: autoBannedFilter,
        page: (filters.page as number) || 1,
        pageSize: (filters.pageSize as number) || 50,
      });

      const page = (filters.page as number) || 1;
      const pageSize = (filters.pageSize as number) || 50;

      return { 
        data: records, 
        total, 
        page, 
        pageSize, 
        totalPages: Math.ceil(total / pageSize) 
      };
    }

    case "getRecordByKey": {
      const record = await findByUpsertKey(filters.upsertKey as string);
      return record || null;
    }

    case "getAutoBannedRecords": {
      const { records, total } = await getAllRecords({
        search: filters.search as string,
        autoBanned: true,
        page: (filters.page as number) || 1,
        pageSize: (filters.pageSize as number) || 50,
      });
      
      const page = (filters.page as number) || 1;
      const pageSize = (filters.pageSize as number) || 50;
      
      return { data: records, total, page, pageSize };
    }

    case "getDistinctValues": {
      const field = filters.field as keyof ScreeningRecord;
      if (!field) throw new Error("Field is required");
      return await getDistinctValues(field);
    }

    default:
      throw new Error(`Unknown action: ${action}`);
  }
}
