import { auth } from "@clerk/nextjs/server"
import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
)

// GET - Fetch user's transcription history
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const search = searchParams.get("search")?.toLowerCase() || ""
    const sort = searchParams.get("sort") || "recent"
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    let query = supabase
      .from("transcriptions")
      .select("*", { count: "exact" })
      .eq("user_id", userId)

    // Apply search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,video_id.ilike.%${search}%,original_transcript.ilike.%${search}%`)
    }

    // Apply sorting
    if (sort === "recent") {
      query = query.order("created_at", { ascending: false })
    } else if (sort === "oldest") {
      query = query.order("created_at", { ascending: true })
    } else if (sort === "longest") {
      query = query.order("word_count", { ascending: false })
    }

    // Apply pagination
    const { data, error, count } = await query.range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({
      data: data || [],
      count: count || 0,
      total: count,
    })
  } catch (error) {
    console.error("Error fetching transcription history:", error)
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    )
  }
}

// POST - Save a new transcription
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const {
      video_id,
      title,
      original_transcript,
      refined_transcript,
      thumbnail_url,
    } = body

    if (!original_transcript) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const wordCount = refined_transcript
      ? refined_transcript.split(/\s+/).length
      : original_transcript.split(/\s+/).length

    const { data, error } = await supabase
      .from("transcriptions")
      .insert({
        user_id: userId,
        video_id,
        title,
        original_transcript,
        refined_transcript,
        thumbnail_url,
        word_count: wordCount,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Error saving transcription:", error)
    return NextResponse.json(
      { error: "Failed to save transcription" },
      { status: 500 }
    )
  }
}

// DELETE - Delete a transcription
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 })
    }

    const { error } = await supabase
      .from("transcriptions")
      .delete()
      .eq("id", id)
      .eq("user_id", userId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting transcription:", error)
    return NextResponse.json(
      { error: "Failed to delete transcription" },
      { status: 500 }
    )
  }
}
