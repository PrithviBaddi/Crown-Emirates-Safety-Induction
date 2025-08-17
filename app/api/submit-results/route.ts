import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    console.log("🧪 Starting Supabase test + insert")

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    const envCheck = {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      urlFormat: supabaseUrl ? (supabaseUrl.startsWith('https://') ? 'valid' : 'invalid') : 'missing',
      urlValue: supabaseUrl || 'NOT_SET'
    }

    console.log("Environment check:", envCheck)

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: "Missing environment variables",
        envCheck
      })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log("📥 Reading request body...")
    const { userData, answers, questions, passed, score } = await request.json()

    console.log("📊 Inserting data into Supabase...")

    const { data, error } = await supabase.from("assessment_results").insert([
      {
        name: userData.name,
        company: userData.company,
        phone: userData.phone,
        host_name: userData.hostName,
        score: score,
        passed: passed,
        completed_at: new Date().toISOString(),
      }
    ])

    if (error) {
      console.error("❌ Database insert error:", error)
      return NextResponse.json({
        success: false,
        error: "Insert failed",
        details: error,
        envCheck
      })
    }

    console.log("✅ Data inserted successfully!")

    return NextResponse.json({
      success: true,
      message: "Insert successful",
      insertedRow: data,
      envCheck: {
        ...envCheck,
        urlValue: supabaseUrl.substring(0, 30) + "..."
      }
    })
  } catch (error: any) {
    console.error("❌ API error:", error)

    return NextResponse.json({
      success: false,
      error: "Unexpected error",
      details: {
        message: error.message,
        name: error.name,
        code: error.code
      }
    })
  }
}
