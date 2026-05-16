import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import SharedNote from "@/models/SharedNote";
import Note from "@/models/Note";
import Tag from "@/models/Tag";
import Category from "@/models/Category";

type RouteContext = {
  params: Promise<{ shareId: string }>;
};

export async function GET(req: Request, context: RouteContext) {
  try {
    const { shareId } = await context.params;

    if (!shareId || !shareId.match(/^[0-9a-fA-F]{32}$/)) {
      return NextResponse.json({ success: false, error: "Invalid share link format" }, { status: 400 });
    }

    await dbConnect();

    Tag.init();
    Category.init();

    const sharedNote = await SharedNote.findOne({ shareId }).lean();

    if (!sharedNote || !sharedNote.isPublic) {
      return NextResponse.json(
        { success: false, error: "This note is not publicly available or the link is invalid." },
        { status: 404 }
      );
    }

    const note = await Note.findById(sharedNote.noteId)
      .populate("tags")
      .populate("category")
      .lean();

    if (!note || note.archived) {
      return NextResponse.json(
        { success: false, error: "This note is no longer available." },
        { status: 404 }
      );
    }
    const sanitizedNote = {
      title: note.title,
      content: note.content,
      tags: note.tags?.map((t: any) => t.name) || [],
      category: note.category?.name || null,
      updatedAt: note.updatedAt,
    };

    return NextResponse.json({ success: true, note: sanitizedNote });
  } catch (error) {
    console.error("PUBLIC_FETCH_ERROR:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
