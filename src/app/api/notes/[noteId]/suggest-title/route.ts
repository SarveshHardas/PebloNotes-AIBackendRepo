import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Note from "@/models/Note";
import { getAuthUser } from "@/lib/auth";
import { generateText } from "@/lib/gemini";

type RouteContext = {
  params: Promise<{ noteId: string }>;
};

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
    if (noteContent.length < 25) {
      return NextResponse.json(
        { success: false, error: "Note text must have at least 25 characters to suggest a contextual title." },
        { status: 400 }
      );
    }

    const systemInstruction = 
      "You are a quiet assistant integrated into a minimal writing application. " +
      "Read the note text and generate ONE short, clear, human-sounding title. " +
      "Deliver the key essence in 2 to 5 words. " +
      "Do NOT use introductory labels, quotation marks, emojis, or clickbait formats. " +
      "Provide strictly the text of the title itself.";

    const userPrompt = `Provide a clean, meaningful title for this note:\n\nContent:\n${noteContent}`;

    let suggestedTitle: string;
    try {
      suggestedTitle = await generateText(userPrompt, {
        systemInstruction,
        temperature: 0.4,
        maxOutputTokens: 64,
      });
    } catch (aiError) {
      console.error("[SUGGEST_TITLE_AI_FAILED]:", aiError);
      return NextResponse.json(
        { success: false, error: "AI title processing is temporarily offline. Try again later." },
        { status: 503 }
      );
    }

    const sanitizedTitle = suggestedTitle
      .replace(/^["']|["']$/g, "")
      .replace(/^Title:\s*/i, "")
      .trim();

    return NextResponse.json({
      success: true,
      title: sanitizedTitle,
    });
  } catch (error) {
    console.error("[SUGGEST_TITLE_ERROR]:", error);
    return NextResponse.json({ success: false, error: "Internal server failure suggesting title." }, { status: 500 });
  }
}
