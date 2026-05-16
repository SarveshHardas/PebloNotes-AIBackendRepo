import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import dbConnect from "@/lib/db";
import Note from "@/models/Note";
import SharedNote from "@/models/SharedNote";
import { getAuthUser } from "@/lib/auth";

type RouteContext = {
  params: Promise<{ noteId: string }>;
};

const patchShareSchema = z.object({
  isPublic: z.boolean(),
});

export async function GET(req: Request, context: RouteContext) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    const { noteId } = await context.params;
    if (!noteId.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json({ success: false, error: "Invalid Note ID format" }, { status: 400 });
    }

    await dbConnect();

    const note = await Note.findOne({ _id: noteId, userId: authUser.id }).lean();
    if (!note) {
      return NextResponse.json({ success: false, error: "Note not found or unauthorized" }, { status: 404 });
    }

    const sharedNote = await SharedNote.findOne({ noteId, userId: authUser.id }).lean();
    
    return NextResponse.json({ success: true, sharedNote });
  } catch (error) {
    console.error("GET_SHARE_ERROR:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request, context: RouteContext) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    const { noteId } = await context.params;
    if (!noteId.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json({ success: false, error: "Invalid Note ID format" }, { status: 400 });
    }

    await dbConnect();

    const note = await Note.findOne({ _id: noteId, userId: authUser.id }).lean();
    if (!note) {
      return NextResponse.json({ success: false, error: "Note not found or unauthorized" }, { status: 404 });
    }

    let sharedNote = await SharedNote.findOne({ noteId, userId: authUser.id });

    if (!sharedNote) {
      const shareId = crypto.randomBytes(16).toString("hex");
      sharedNote = await SharedNote.create({
        noteId,
        userId: authUser.id,
        shareId,
        isPublic: true,
      });
    } else if (!sharedNote.isPublic) {
      sharedNote.isPublic = true;
      await sharedNote.save();
    }

    return NextResponse.json({ success: true, sharedNote });
  } catch (error) {
    console.error("POST_SHARE_ERROR:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    const { noteId } = await context.params;
    if (!noteId.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json({ success: false, error: "Invalid Note ID format" }, { status: 400 });
    }

    await dbConnect();

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON payload" }, { status: 400 });
    }

    const validation = patchShareSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, error: "Validation failed" }, { status: 400 });
    }

    const note = await Note.findOne({ _id: noteId, userId: authUser.id }).lean();
    if (!note) {
      return NextResponse.json({ success: false, error: "Note not found or unauthorized" }, { status: 404 });
    }

    const sharedNote = await SharedNote.findOneAndUpdate(
      { noteId, userId: authUser.id },
      { isPublic: validation.data.isPublic },
      { new: true }
    ).lean();

    if (!sharedNote) {
      return NextResponse.json({ success: false, error: "Share link not generated yet. Enable sharing first." }, { status: 400 });
    }

    return NextResponse.json({ success: true, sharedNote });
  } catch (error) {
    console.error("PATCH_SHARE_ERROR:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
