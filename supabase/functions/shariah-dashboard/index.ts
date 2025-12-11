import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { MongoClient } from "https://deno.land/x/mongo@v0.32.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const mongoUri = Deno.env.get("MONGODB_URI");
const dbName = Deno.env.get("MONGODB_DB_NAME") || "shariah_screening";

if (!mongoUri) {
  console.error("❌ MONGODB_URI environment variable is not set");
}

// Reuse a single Mongo client across requests
const client = new MongoClient();
let dbPromise: Promise<ReturnType<MongoClient["database"]>> | null = null;

async function getDb() {
  if (!mongoUri) {
    throw new Error("MONGODB_URI is not configured");
  }

  if (!dbPromise) {
    console.log("Connecting to MongoDB Atlas...");
    dbPromise = (async () => {
      // SRV connection string is supported by this driver
      await client.connect(mongoUri);
      console.log("✅ Connected to MongoDB Atlas");
      return client.database(dbName);
    })();
  }

  return dbPromise;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, filters } = await req.json();
    console.log("Action:", action, "Filters:", JSON.stringify(filters || {}));

    const db = await getDb();
    const result = await handleAction(db, action, (filters || {}) as Record<string, unknown>);

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

async function handleAction(db: ReturnType<MongoClient["database"]>, action: string, filters: Record<string, unknown>) {
  switch (action) {
    // ---------- 1) Main client-facing records ----------
    case "getClientFacingRecords": {
      // IMPORTANT: collection name must match Atlas exactly
      const collection = db.collection("Client-facing Full");
      const query = buildClientFacingQuery(filters);

      const page = (filters.page as number) || 1;
      const pageSize = (filters.pageSize as number) || 50;
      const skip = (page - 1) * pageSize;
      const sortField = (filters.sortBy as string) || "Screening_Date";
      const sortOrder = filters.sortOrder === "asc" ? 1 : -1;

      const total = await collection.countDocuments(query);
      const data = await collection
        .find(query)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(pageSize)
        .toArray();

      return {
        data,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    }

    // ---------- 2) Single record by upsert key ----------
    case "getRecordByKey": {
      const collection = db.collection("Client-facing Full");
      // NOTE: field name must match your documents: upsert_key vs Upsert_Key
      return await collection.findOne({ upsert_key: filters.upsertKey });
    }

    // ---------- 3) Numeric-only record ----------
    case "getNumericRecord": {
      const collection = db.collection("numeric_only_screening");
      return await collection.findOne({ upsert_key: filters.upsertKey });
    }

    // ---------- 4) Industry methodology ----------
    case "getIndustryMethodology": {
      const collection = db.collection("industry_methodology");
      return await collection.findOne({ upsert_key: filters.upsertKey });
    }

    // ---------- 5) Auto-banned records ----------
    case "getAutoBannedRecords": {
      const collection = db.collection("industry_methodology");
      const query: Record<string, unknown> = { auto_banned: true };

      if (filters.search) {
        query.$or = [
          { ticker: { $regex: filters.search, $options: "i" } },
          { company_name: { $regex: filters.search, $options: "i" } },
        ];
      }

      const page = (filters.page as number) || 1;
      const pageSize = (filters.pageSize as number) || 50;
      const skip = (page - 1) * pageSize;

      const total = await collection.countDocuments(query);
      const data = await collection.find(query).sort({ created_at: -1 }).skip(skip).limit(pageSize).toArray();

      return {
        data,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    }

    // ---------- 6) Numeric-only records list ----------
    case "getNumericRecords": {
      const collection = db.collection("numeric_only_screening");
      const query: Record<string, unknown> = {};

      if (filters.search) {
        query.$or = [
          { Ticker: { $regex: filters.search, $options: "i" } },
          { Company: { $regex: filters.search, $options: "i" } },
        ];
      }

      if (filters.numericStatus && filters.numericStatus !== "all") {
        query.Numeric_Status = filters.numericStatus;
      }

      const page = (filters.page as number) || 1;
      const pageSize = (filters.pageSize as number) || 50;
      const skip = (page - 1) * pageSize;

      const total = await collection.countDocuments(query);
      const data = await collection.find(query).sort({ numeric_timestamp: -1 }).skip(skip).limit(pageSize).toArray();

      return {
        data,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    }

    // ---------- 7) Distinct values for filters ----------
    case "getDistinctValues": {
      const collection = db.collection("Client-facing Full");
      const field = filters.field as string | undefined;
      if (!field) throw new Error("Field is required for getDistinctValues");

      const values = await collection.distinct(field);
      return values.filter((v: unknown) => v !== null && v !== undefined && v !== "");
    }

    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

function buildClientFacingQuery(filters: Record<string, unknown>): Record<string, unknown> {
  const query: Record<string, unknown> = {};

  if (filters.search) {
    query.$or = [
      { Ticker: { $regex: filters.search, $options: "i" } },
      { Company: { $regex: filters.search, $options: "i" } },
    ];
  }

  if (filters.ticker) {
    query.Ticker = { $regex: filters.ticker, $options: "i" };
  }

  if (filters.sector && filters.sector !== "all") {
    query.Sector = filters.sector;
  }

  if (filters.industry && filters.industry !== "all") {
    query.Industry = filters.industry;
  }

  if (filters.finalVerdict && filters.finalVerdict !== "all") {
    query.Final_Verdict = filters.finalVerdict;
  }

  if (filters.riskLevel && filters.riskLevel !== "all") {
    query.Compliance_Risk_Level = filters.riskLevel;
  }

  if (filters.shariahCompliant && filters.shariahCompliant !== "all") {
    query.Shariah_Compliant = filters.shariahCompliant;
  }

  if (filters.boardReviewNeeded && filters.boardReviewNeeded !== "all") {
    query.Board_Review_Needed = filters.boardReviewNeeded;
  }

  if (filters.autoBanned === "YES") {
    query.Auto_Banned = true;
  } else if (filters.autoBanned === "NO") {
    query.Auto_Banned = { $ne: true };
  }

  // Zakat filters
  if (filters.zakatStatus && filters.zakatStatus !== "all") {
    query.Zakat_Status = filters.zakatStatus;
  }

  if (filters.zakatableAssetsMin) {
    query.Zakatable_Assets_Ratio_Percent = {
      $gte: filters.zakatableAssetsMin,
    };
  }

  if (filters.zakatMethodology && filters.zakatMethodology !== "all") {
    query.Zakat_Methodology = filters.zakatMethodology;
  }

  return query;
}
