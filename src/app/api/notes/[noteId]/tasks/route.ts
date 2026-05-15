import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Note from "@/models/Note";
import AIHistory from "@/models/AIHistory";
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

    const historyRecord = await AIHistory.findOne({
      noteId,
      userId: authUser.id,
      type: "tasks",
    }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      tasks: historyRecord ? historyRecord.response : null,
      generatedAt: historyRecord ? historyRecord.createdAt : null,
    });
  } catch (error) {
    console.error("[TASKS_GET_ERROR]:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
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

    const noteContent = note.content?.trim() || "";
    if (noteContent.length < 30) {
      return NextResponse.json(
        { success: false, error: "Note content is too short to extract actionable tasks." },
        { status: 400 }
      );
    }

    const systemInstruction = 
      "You are a smart productivity processor. Analyze the note content and extract concrete, actionable tasks. " +
      "Focus strictly on practical work items (e.g., 'Review onboarding flow', 'Fix spacing bug'). " +
      "Do NOT hallucinate tasks, avoid motivational buzzwords, and exclude general corporate platitudes. " +
      "If no clear actions exist, return an empty array. " +
      "Return ONLY a valid JSON array of strings. Do not add any other text outside the array.";

    const userPrompt = `Analyze and extract tasks from this note:\n\nTitle: ${note.title}\n\nContent:\n${noteContent}`;

    let responseText: string;
    try {
      responseText = await generateText(userPrompt, {
        systemInstruction,
        temperature: 0.2,
        maxOutputTokens: 800,
        responseMimeType: "application/json",
      });
    } catch (aiError) {
      console.error("[TASKS_AI_EXTRACTION_FAILED]:", aiError);
      return NextResponse.json(
        { success: false, error: "AI tasks parsing services are busy. Please try again soon." },
        { status: 503 }
      );
    }

    let extractedTasks: string[] = [];
    try {
      const parsed = JSON.parse(responseText);
      if (Array.isArray(parsed)) {
        extractedTasks = parsed
          .map((t) => String(t).trim())
          .filter((t) => t.length > 0);
      }
    } catch (parseErr) {
      console.error("[JSON_PARSE_ERROR]: Could not deserialize task payload", responseText);
      return NextResponse.json({ success: false, error: "AI returned invalid task format." }, { status: 500 });
    }

    if (extractedTasks.length === 0) {
      return NextResponse.json({
        success: true,
        tasks: [],
        message: "No distinct actionable tasks were identified in this note."
      });
    }

    const historyEntry = await AIHistory.create({
      userId: authUser.id,
      noteId,
      type: "tasks",
      response: extractedTasks,
    });

    return NextResponse.json({
      success: true,
      tasks: historyEntry.response,
      generatedAt: historyEntry.createdAt,
    });
  } catch (error) {
    console.error("[TASKS_POST_ERROR]:", error);
    return NextResponse.json({ success: false, error: "Unexpected internal tasks extraction failure." }, { status: 500 });
  }
}
