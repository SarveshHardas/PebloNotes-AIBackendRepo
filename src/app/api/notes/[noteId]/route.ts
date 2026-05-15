import { NextResponse } from "next/server";
import { z } from "zod";
import dbConnect from "@/lib/db";
import Note from "@/models/Note";
import Tag from "@/models/Tag";
import { getAuthUser } from "@/lib/auth";

const patchNoteSchema = z.object({
  title: z.string().trim().min(1, "Title must have at least 1 character").max(100).optional(),
  content: z.string().optional(),
  archived: z.boolean().optional(),
  tags: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
  category: z.string().regex(/^[0-9a-fA-F]{24}$/).nullable().optional(),
});

type RouteContext = {
  params: Promise<{ noteId: string }>;
};

export async function PATCH(req: Request, context: RouteContext) {
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

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON payload" }, { status: 400 });
    }

    const validation = patchNoteSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, error: "Validation failed", issues: validation.error.format() }, { status: 400 });
    }

    const updatedNote = await Note.findOneAndUpdate(
      { _id: noteId, userId: authUser.id },
      { $set: validation.data },
      { returnDocument: "after" }
    ).populate("tags").populate("category").lean();

    if (!updatedNote) {
      return NextResponse.json({ success: false, error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Note updated successfully", note: updatedNote });
  } catch (error: any) {
    console.error("PATCH_NOTE_ERROR:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: RouteContext) {
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

    const deletedNote = await Note.findOneAndDelete({
      _id: noteId,
      userId: authUser.id,
    });

    if (!deletedNote) {
      return NextResponse.json({ success: false, error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Note deleted permanently" });
  } catch (error: any) {
    console.error("DELETE_NOTE_ERROR:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
