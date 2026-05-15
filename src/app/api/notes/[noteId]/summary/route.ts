import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Note from "@/models/Note";
import Summary from "@/models/Summary";
import { getAuthUser } from "@/lib/auth";
import { generateText } from "@/lib/gemini";

type RouteContext = {
  params: Promise<{ noteId: string }>;
};

export async function GET(req: Request, context: RouteContext) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { noteId } = await context.params;
    if (!noteId.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json({ success: false, error: "Invalid Note ID" }, { status: 400 });
    }

    await dbConnect();

    const note = await Note.findOne({ _id: noteId, userId: authUser.id });
    if (!note) {
      return NextResponse.json({ success: false, error: "Note not found" }, { status: 404 });
    }

    const existingSummary = await Summary.findOne({ noteId, userId: authUser.id });

    return NextResponse.json({
      success: true,
      summary: existingSummary ? {
        _id: existingSummary._id,
        summary: existingSummary.summary,
        createdAt: existingSummary.createdAt,
        updatedAt: existingSummary.updatedAt,
      } : null,
    });
  } catch (error: any) {
    console.error("[SUMMARY_GET_ERROR]:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request, context: RouteContext) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { noteId } = await context.params;
    if (!noteId.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json({ success: false, error: "Invalid Note ID" }, { status: 400 });
    }

    await dbConnect();

    const note = await Note.findOne({ _id: noteId, userId: authUser.id });
    if (!note) {
      return NextResponse.json({ success: false, error: "Note not found" }, { status: 404 });
    }

    const rawContent = note.content?.trim() || "";
    if (rawContent.length < 20) {
      return NextResponse.json(
        { success: false, error: "Content is too brief. Please add more detail to build a summary." },
        { status: 400 }
      );
    }

    const systemInstruction = 
      "You are a quiet, thoughtful writing tool. " +
      "Provide a direct, practical summary of the user's note. " +
      "Focus solely on core takeaways. Keep it brief, naturally phrased (1 to 3 short sentences). " +
      "Do NOT include intro statements like 'Here is a summary:' or robotic summaries. " +
      "Avoid markdown headings. Deliver just the clean sentence text.";

    const userPrompt = `Summarize the core essence of this note:\n\nTitle: ${note.title}\n\nContent:\n${rawContent}`;

    let generatedText: string;
    try {
      generatedText = await generateText(userPrompt, {
        systemInstruction,
        temperature: 0.3,
        maxOutputTokens: 300,
      });
    } catch (aiError: any) {
      console.error("[SUMMARY_AI_INFERENCE_FAILED]:", aiError);
      return NextResponse.json(
        { success: false, error: "AI context processing is offline or rate limited. Try again in a minute." },
        { status: 503 }
      );
    }

    const storedSummary = await Summary.findOneAndUpdate(
      { noteId, userId: authUser.id },
      { $set: { summary: generatedText.trim() } },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      summary: {
        _id: storedSummary._id,
        summary: storedSummary.summary,
        createdAt: storedSummary.createdAt,
        updatedAt: storedSummary.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("[SUMMARY_POST_ERROR]:", error);
    return NextResponse.json({ success: false, error: "Unexpected AI routine failures." }, { status: 500 });
  }
}
