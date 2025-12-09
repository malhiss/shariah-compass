import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { MongoClient } from "https://deno.land/x/mongo@v0.32.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper to URL-encode MongoDB URI password
function encodeMongoUri(uri: string): string {
  try {
    const match = uri.match(/^(mongodb(?:\+srv)?:\/\/)([^:]+):([^@]+)@(.+)$/);
    if (match) {
      const [, protocol, username, password, rest] = match;
      const encodedUsername = encodeURIComponent(username);
      const encodedPassword = encodeURIComponent(password);
      return `${protocol}${encodedUsername}:${encodedPassword}@${rest}`;
    }
    return uri;
  } catch {
    return uri;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let client: MongoClient | null = null;

  try {
    const rawUri = Deno.env.get("MONGODB_URI");
    if (!rawUri) {
      throw new Error("MONGODB_URI environment variable is not set");
    }

    const mongoUri = encodeMongoUri(rawUri);
    client = new MongoClient();
    await client.connect(mongoUri);

    const db = client.database("shariah_screening");
    const { action, filters } = await req.json();

    let result;

    switch (action) {
      case "getClientFacingRecords": {
        const collection = db.collection("Client-facing Full");
        
        // Build query
        const query: Record<string, unknown> = {};
        
        if (filters?.search) {
          query.$or = [
            { Ticker: { $regex: filters.search, $options: "i" } },
            { Company: { $regex: filters.search, $options: "i" } },
          ];
        }
        
        if (filters?.ticker) {
          query.Ticker = { $regex: filters.ticker, $options: "i" };
        }
        
        if (filters?.sector && filters.sector !== "all") {
          query.Sector = filters.sector;
        }
        
        if (filters?.industry && filters.industry !== "all") {
          query.Industry = filters.industry;
        }
        
        if (filters?.finalVerdict && filters.finalVerdict !== "all") {
          query.Final_Verdict = filters.finalVerdict;
        }
        
        if (filters?.riskLevel && filters.riskLevel !== "all") {
          query.Compliance_Risk_Level = filters.riskLevel;
        }
        
        if (filters?.shariahCompliant && filters.shariahCompliant !== "all") {
          query.Shariah_Compliant = filters.shariahCompliant;
        }
        
        if (filters?.boardReviewNeeded && filters.boardReviewNeeded !== "all") {
          query.Board_Review_Needed = filters.boardReviewNeeded;
        }
        
        if (filters?.autoBanned === "YES") {
          query.Auto_Banned = true;
        } else if (filters?.autoBanned === "NO") {
          query.Auto_Banned = { $ne: true };
        }

        // Zakat filters
        if (filters?.zakatStatus && filters.zakatStatus !== "all") {
          query.Zakat_Status = filters.zakatStatus;
        }

        if (filters?.zakatableAssetsMin) {
          query.Zakatable_Assets_Ratio_Percent = { $gte: filters.zakatableAssetsMin };
        }

        if (filters?.zakatMethodology && filters.zakatMethodology !== "all") {
          query.Zakat_Methodology = filters.zakatMethodology;
        }

        // Pagination
        const page = filters?.page || 1;
        const pageSize = filters?.pageSize || 50;
        const skip = (page - 1) * pageSize;

        // Sorting
        const sortField = filters?.sortBy || "Screening_Date";
        const sortOrder = filters?.sortOrder === "asc" ? 1 : -1;
        const sort = { [sortField]: sortOrder };

        // Execute query
        const total = await collection.countDocuments(query);
        const data = await collection
          .find(query)
          .sort(sort)
          .skip(skip)
          .limit(pageSize)
          .toArray();

        result = {
          data,
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        };
        break;
      }

      case "getRecordByKey": {
        const collection = db.collection("Client-facing Full");
        const record = await collection.findOne({ upsert_key: filters?.upsertKey });
        result = record;
        break;
      }

      case "getNumericRecord": {
        const collection = db.collection("numeric_only_screening");
        const record = await collection.findOne({ upsert_key: filters?.upsertKey });
        result = record;
        break;
      }

      case "getIndustryMethodology": {
        const collection = db.collection("industry_methodology");
        const record = await collection.findOne({ upsert_key: filters?.upsertKey });
        result = record;
        break;
      }

      case "getAutoBannedRecords": {
        const collection = db.collection("industry_methodology");
        
        const query: Record<string, unknown> = { auto_banned: true };
        
        if (filters?.search) {
          query.$or = [
            { ticker: { $regex: filters.search, $options: "i" } },
            { company_name: { $regex: filters.search, $options: "i" } },
          ];
        }

        const page = filters?.page || 1;
        const pageSize = filters?.pageSize || 50;
        const skip = (page - 1) * pageSize;

        const total = await collection.countDocuments(query);
        const data = await collection
          .find(query)
          .sort({ created_at: -1 })
          .skip(skip)
          .limit(pageSize)
          .toArray();

        result = {
          data,
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        };
        break;
      }

      case "getNumericRecords": {
        const collection = db.collection("numeric_only_screening");
        
        const query: Record<string, unknown> = {};
        
        if (filters?.search) {
          query.$or = [
            { Ticker: { $regex: filters.search, $options: "i" } },
            { Company: { $regex: filters.search, $options: "i" } },
          ];
        }

        if (filters?.numericStatus && filters.numericStatus !== "all") {
          query.Numeric_Status = filters.numericStatus;
        }

        const page = filters?.page || 1;
        const pageSize = filters?.pageSize || 50;
        const skip = (page - 1) * pageSize;

        const total = await collection.countDocuments(query);
        const data = await collection
          .find(query)
          .sort({ numeric_timestamp: -1 })
          .skip(skip)
          .limit(pageSize)
          .toArray();

        result = {
          data,
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        };
        break;
      }

      case "getDistinctValues": {
        const collection = db.collection("Client-facing Full");
        const field = filters?.field;
        
        if (!field) {
          throw new Error("Field is required for getDistinctValues");
        }
        
        const values = await collection.distinct(field);
        result = values.filter((v: unknown) => v !== null && v !== undefined && v !== "");
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    await client.close();

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Shariah dashboard error:", error);
    
    if (client) {
      try {
        await client.close();
      } catch {}
    }

    const errorMessage = error instanceof Error ? error.message : "Internal server error";

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});