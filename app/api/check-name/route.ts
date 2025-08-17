import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Check name API called")
    
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    console.log("🔧 Environment check:")
    console.log("- Supabase URL:", supabaseUrl ? "✅ Set" : "❌ Missing")
    console.log("- Service Role Key:", supabaseKey ? "✅ Set" : "❌ Missing")
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("❌ Missing environment variables for name check")
      return NextResponse.json(
        {
          error: "Server configuration error",
          details: "Missing Supabase credentials"
        },
        { status: 500 }
      )
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey)
    console.log("✅ Supabase client created")

    // Parse request body with error handling
    let requestBody;
    try {
      requestBody = await request.json()
    } catch (parseError) {
      console.error("❌ Failed to parse request body:", parseError)
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: "Request body must be valid JSON"
        },
        { status: 400 }
      )
    }

    const { name } = requestBody
    
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: "Name is required and must be a string"
        },
        { status: 400 }
      )
    }

    const trimmedName = name.trim()
    if (trimmedName.length < 2) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: "Name must be at least 2 characters long"
        },
        { status: 400 }
      )
    }

    console.log("🔍 Searching for completions for name:", trimmedName);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    console.log("📅 Six months ago date:", sixMonthsAgo.toISOString());

    // First, let's test the connection by getting all records
    console.log("🧪 Testing database connection...");
    const connectionTest = await supabase
      .from("assessment_results")
      .select("count", { count: 'exact' });
    
    console.log("🧪 Connection test result:", connectionTest);

    // Also get a few sample records to see what's in the database
    const sampleRecords = await supabase
      .from("assessment_results")
      .select("id, name, passed, completed_at")
      .limit(5);
    
    console.log("🧪 Sample records:", sampleRecords);

    // Try different search methods to find the record
    console.log("🔍 Trying exact match first...");
    let { data, error } = await supabase
      .from("assessment_results")
      .select("*")
      .eq("name", trimmedName)
      .order("completed_at", { ascending: false });

    console.log("🔍 Exact match result:", { data, error, searchTerm: trimmedName });

    if (error) {
      console.error("❌ Database error during exact search:", error);
      return NextResponse.json(
        {
          error: "Database error",
          details: error.message
        },
        { status: 500 }
      );
    }

    // If no exact match, try case-insensitive search using ilike
    if (!data?.length) {
      console.log("🔍 No exact match, trying case-insensitive search...");
      const result = await supabase
        .from("assessment_results")
        .select("*")
        .ilike("name", trimmedName)
        .order("completed_at", { ascending: false });
      
      console.log("🔍 Case-insensitive result:", result);
      data = result.data;
      error = result.error;
    }

    // If still no match, try wildcard search with case-insensitive
    if (!data?.length) {
      console.log("🔍 No case-insensitive match, trying wildcard search...");
      const result = await supabase
        .from("assessment_results")
        .select("*")
        .ilike("name", `%${trimmedName}%`)
        .order("completed_at", { ascending: false });
      
      console.log("🔍 Wildcard result:", result);
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error("❌ Database error during search:", error);
      return NextResponse.json(
        {
          error: "Database error",
          details: error.message
        },
        { status: 500 }
      );
    }

    console.log(`✅ Found ${data?.length || 0} completions for ${trimmedName}`);
    console.log("📋 All found records:", data);

    const hasCompletions = data && data.length > 0;
    
    // Check if there's a recent completion (within 6 months, regardless of pass/fail)
    const recentCompletion = data?.find(completion => {
      const completedDate = new Date(completion.completed_at);
      const isWithinSixMonths = completedDate >= sixMonthsAgo;
      
      console.log("🔍 Checking completion:", {
        id: completion.id,
        name: completion.name,
        passed: completion.passed,
        completed_at: completion.completed_at,
        completedDate: completedDate.toISOString(),
        sixMonthsAgo: sixMonthsAgo.toISOString(),
        isWithinSixMonths,
        qualifies: isWithinSixMonths
      });
      
      return isWithinSixMonths;
    });

    // Get the most recent completion within 6 months (could be passed or failed)
    const mostRecentCompletion = data?.filter(completion => {
      const completedDate = new Date(completion.completed_at);
      return completedDate >= sixMonthsAgo;
    }).sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())[0];

    console.log("🎯 Recent completion found:", !!recentCompletion);
    if (recentCompletion) {
      console.log("✅ User has recent completion - directing to training history");
      console.log("📊 Most recent completion status:", {
        passed: mostRecentCompletion?.passed,
        score: mostRecentCompletion?.score,
        date: mostRecentCompletion?.completed_at
      });
    } else {
      console.log("❌ User has no recent completion - directing to video section");
    }

    return NextResponse.json({
      success: true,
      hasCompletions,
      completions: data || [],
      searchedName: trimmedName,
      hasRecentCompletion: !!recentCompletion, // Changed from hasRecentValidCompletion
      recentCompletion: mostRecentCompletion || null, // Changed from recentValidCompletion
      message: hasCompletions
        ? `Found ${data?.length || 0} previous completion(s)`
        : "No previous completions found",
      debug: {
        sixMonthsAgo: sixMonthsAgo.toISOString(),
        totalRecords: data?.length || 0,
        searchMethod: data?.length ? "found" : "not found",
        recentCompletionsCount: data?.filter(c => new Date(c.completed_at) >= sixMonthsAgo).length || 0
      }
    });

  } catch (error: any) {
    console.error("❌ Name check API error:", error)
    
    return NextResponse.json(
      {
        error: "Failed to check name",
        details: error?.message || "Unknown error"
      },
      { status: 500 }
    )
  }
}

// Optional: Add GET method for testing
export async function GET() {
  return NextResponse.json({ 
    message: "Check name API is running",
    methods: ["POST"],
    expectedBody: { name: "Full Name" },
    timestamp: new Date().toISOString()
  })
}