import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// MongoDB Atlas Data API configuration
const MONGODB_DATA_API_URL = "https://data.mongodb-api.com/app/data-fedpq/endpoint/data/v1";

async function mongoRequest(action: string, body: Record<string, unknown>) {
  const apiKey = Deno.env.get("MONGODB_API_KEY");
  const uri = Deno.env.get("MONGODB_URI");
  
  // If we have an API key, use the Data API
  if (apiKey) {
    const response = await fetch(`${MONGODB_DATA_API_URL}/action/${action}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        dataSource: "shariah-cluster",
        database: "shariah_screening",
        ...body,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`MongoDB Data API error: ${errorText}`);
    }
    
    return response.json();
  }
  
  // Fallback: Try using native MongoDB driver with the URI
  if (uri) {
    // Import dynamically to avoid issues if URI approach is used
    const { MongoClient } = await import("https://deno.land/x/mongo@v0.32.0/mod.ts");
    
    const client = new MongoClient();
    await client.connect(uri);
    
    const db = client.database("shariah_screening");
    return { db, client };
  }
  
  throw new Error("Neither MONGODB_API_KEY nor MONGODB_URI is configured");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, filters } = await req.json();
    console.log("Action:", action, "Filters:", JSON.stringify(filters));

    // Check if using Data API or native driver
    const apiKey = Deno.env.get("MONGODB_API_KEY");
    const mongoUri = Deno.env.get("MONGODB_URI");
    
    console.log("API Key present:", !!apiKey);
    console.log("URI present:", !!mongoUri);

    let result;
    
    if (apiKey && apiKey.trim() !== "") {
      console.log("Using MongoDB Data API...");
      result = await handleWithDataAPI(action, filters, apiKey);
    } else if (mongoUri) {
      console.log("Using native MongoDB driver...");
      result = await handleWithNativeDriver(action, filters);
    } else {
      throw new Error("No MongoDB credentials configured");
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Shariah dashboard error:", error);
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

async function handleWithDataAPI(action: string, filters: Record<string, unknown>, apiKey: string) {
  const baseRequest = {
    dataSource: "shariah-cluster",
    database: "shariah_screening",
  };

  switch (action) {
    case "getClientFacingRecords": {
      const query = buildClientFacingQuery(filters);
      const page = (filters?.page as number) || 1;
      const pageSize = (filters?.pageSize as number) || 50;
      const skip = (page - 1) * pageSize;
      const sortField = (filters?.sortBy as string) || "Screening_Date";
      const sortOrder = filters?.sortOrder === "asc" ? 1 : -1;

      // Get total count
      const countResponse = await fetch(`${MONGODB_DATA_API_URL}/action/aggregate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "api-key": apiKey },
        body: JSON.stringify({
          ...baseRequest,
          collection: "Client-facing Full",
          pipeline: [{ $match: query }, { $count: "total" }],
        }),
      });
      const countData = await countResponse.json();
      const total = countData.documents?.[0]?.total || 0;

      // Get paginated data
      const dataResponse = await fetch(`${MONGODB_DATA_API_URL}/action/find`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "api-key": apiKey },
        body: JSON.stringify({
          ...baseRequest,
          collection: "Client-facing Full",
          filter: query,
          sort: { [sortField]: sortOrder },
          skip,
          limit: pageSize,
        }),
      });
      const dataResult = await dataResponse.json();

      return {
        data: dataResult.documents || [],
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    }

    case "getRecordByKey": {
      const response = await fetch(`${MONGODB_DATA_API_URL}/action/findOne`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "api-key": apiKey },
        body: JSON.stringify({
          ...baseRequest,
          collection: "Client-facing Full",
          filter: { upsert_key: filters?.upsertKey },
        }),
      });
      const result = await response.json();
      return result.document;
    }

    case "getNumericRecord": {
      const response = await fetch(`${MONGODB_DATA_API_URL}/action/findOne`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "api-key": apiKey },
        body: JSON.stringify({
          ...baseRequest,
          collection: "numeric_only_screening",
          filter: { upsert_key: filters?.upsertKey },
        }),
      });
      const result = await response.json();
      return result.document;
    }

    case "getIndustryMethodology": {
      const response = await fetch(`${MONGODB_DATA_API_URL}/action/findOne`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "api-key": apiKey },
        body: JSON.stringify({
          ...baseRequest,
          collection: "industry_methodology",
          filter: { upsert_key: filters?.upsertKey },
        }),
      });
      const result = await response.json();
      return result.document;
    }

    case "getAutoBannedRecords": {
      const page = (filters?.page as number) || 1;
      const pageSize = (filters?.pageSize as number) || 50;
      const skip = (page - 1) * pageSize;

      const query: Record<string, unknown> = { auto_banned: true };
      if (filters?.search) {
        query.$or = [
          { ticker: { $regex: filters.search, $options: "i" } },
          { company_name: { $regex: filters.search, $options: "i" } },
        ];
      }

      const countResponse = await fetch(`${MONGODB_DATA_API_URL}/action/aggregate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "api-key": apiKey },
        body: JSON.stringify({
          ...baseRequest,
          collection: "industry_methodology",
          pipeline: [{ $match: query }, { $count: "total" }],
        }),
      });
      const countData = await countResponse.json();
      const total = countData.documents?.[0]?.total || 0;

      const dataResponse = await fetch(`${MONGODB_DATA_API_URL}/action/find`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "api-key": apiKey },
        body: JSON.stringify({
          ...baseRequest,
          collection: "industry_methodology",
          filter: query,
          sort: { created_at: -1 },
          skip,
          limit: pageSize,
        }),
      });
      const dataResult = await dataResponse.json();

      return {
        data: dataResult.documents || [],
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    }

    case "getNumericRecords": {
      const page = (filters?.page as number) || 1;
      const pageSize = (filters?.pageSize as number) || 50;
      const skip = (page - 1) * pageSize;

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

      const countResponse = await fetch(`${MONGODB_DATA_API_URL}/action/aggregate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "api-key": apiKey },
        body: JSON.stringify({
          ...baseRequest,
          collection: "numeric_only_screening",
          pipeline: [{ $match: query }, { $count: "total" }],
        }),
      });
      const countData = await countResponse.json();
      const total = countData.documents?.[0]?.total || 0;

      const dataResponse = await fetch(`${MONGODB_DATA_API_URL}/action/find`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "api-key": apiKey },
        body: JSON.stringify({
          ...baseRequest,
          collection: "numeric_only_screening",
          filter: query,
          sort: { numeric_timestamp: -1 },
          skip,
          limit: pageSize,
        }),
      });
      const dataResult = await dataResponse.json();

      return {
        data: dataResult.documents || [],
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    }

    case "getDistinctValues": {
      const field = filters?.field;
      if (!field) throw new Error("Field is required for getDistinctValues");

      const response = await fetch(`${MONGODB_DATA_API_URL}/action/aggregate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "api-key": apiKey },
        body: JSON.stringify({
          ...baseRequest,
          collection: "Client-facing Full",
          pipeline: [
            { $group: { _id: `$${field}` } },
            { $match: { _id: { $ne: null } } },
            { $sort: { _id: 1 } },
          ],
        }),
      });
      const result = await response.json();
      return (result.documents || []).map((d: { _id: unknown }) => d._id).filter((v: unknown) => v !== null && v !== "");
    }

    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

async function handleWithNativeDriver(action: string, filters: Record<string, unknown>) {
  const { MongoClient } = await import("https://deno.land/x/mongo@v0.32.0/mod.ts");
  
  const rawUri = Deno.env.get("MONGODB_URI");
  if (!rawUri) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  console.log("Connecting to MongoDB with native driver...");
  const client = new MongoClient();
  
  try {
    await client.connect(rawUri);
    console.log("Connected successfully");
    
    const db = client.database("shariah_screening");

    let result;

    switch (action) {
      case "getClientFacingRecords": {
        const collection = db.collection("Client-facing Full");
        const query = buildClientFacingQuery(filters);
        
        const page = (filters?.page as number) || 1;
        const pageSize = (filters?.pageSize as number) || 50;
        const skip = (page - 1) * pageSize;
        const sortField = (filters?.sortBy as string) || "Screening_Date";
        const sortOrder = filters?.sortOrder === "asc" ? 1 : -1;

        const total = await collection.countDocuments(query);
        const data = await collection
          .find(query)
          .sort({ [sortField]: sortOrder })
          .skip(skip)
          .limit(pageSize)
          .toArray();

        result = { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
        break;
      }

      case "getRecordByKey": {
        const collection = db.collection("Client-facing Full");
        result = await collection.findOne({ upsert_key: filters?.upsertKey });
        break;
      }

      case "getNumericRecord": {
        const collection = db.collection("numeric_only_screening");
        result = await collection.findOne({ upsert_key: filters?.upsertKey });
        break;
      }

      case "getIndustryMethodology": {
        const collection = db.collection("industry_methodology");
        result = await collection.findOne({ upsert_key: filters?.upsertKey });
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

        const page = (filters?.page as number) || 1;
        const pageSize = (filters?.pageSize as number) || 50;
        const skip = (page - 1) * pageSize;

        const total = await collection.countDocuments(query);
        const data = await collection
          .find(query)
          .sort({ created_at: -1 })
          .skip(skip)
          .limit(pageSize)
          .toArray();

        result = { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
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

        const page = (filters?.page as number) || 1;
        const pageSize = (filters?.pageSize as number) || 50;
        const skip = (page - 1) * pageSize;

        const total = await collection.countDocuments(query);
        const data = await collection
          .find(query)
          .sort({ numeric_timestamp: -1 })
          .skip(skip)
          .limit(pageSize)
          .toArray();

        result = { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
        break;
      }

      case "getDistinctValues": {
        const collection = db.collection("Client-facing Full");
        const field = filters?.field;
        if (!field) throw new Error("Field is required for getDistinctValues");
        
        const values = await collection.distinct(field as string);
        result = values.filter((v: unknown) => v !== null && v !== undefined && v !== "");
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    await client.close();
    return result;
  } catch (error) {
    try { await client.close(); } catch {}
    throw error;
  }
}

function buildClientFacingQuery(filters: Record<string, unknown>): Record<string, unknown> {
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

  return query;
}