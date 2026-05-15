import { NextResponse } from "next/server";
import { z } from "zod";
import dbConnect from "@/lib/db";
import Note from "@/models/Note";
import { getAuthUser } from "@/lib/auth";

const createNoteSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Note title is required.")
    .max(100, "Title cannot exceed 100 characters."),
  content: z
    .string()
    .optional(),
  tags: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid tag format"))
    .optional(),
  category: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid category format")
    .nullable()
    .optional(),
});

export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access. Please sign in." },
        { status: 401 }
      );
    }

    await dbConnect();

    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload." },
        { status: 400 }
      );
    }

    const validationResult = createNoteSchema.safeParse(body);
    if (!validationResult.success) {
      const formattedErrors = validationResult.error.issues.map(
        (issue) => issue.message
      );
      return NextResponse.json(
        { success: false, errors: formattedErrors },
        { status: 400 }
      );
    }

    const { title, content, tags, category } = validationResult.data;

    const newNote = await Note.create({
      title,
      content: content || "",
      tags: tags || [],
      category: category || undefined,
      userId: authUser.id,
      archived: false,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Note created successfully.",
        note: newNote,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("CRITICAL_CREATE_NOTE_ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access. Please sign in." },
        { status: 401 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const includeArchived = searchParams.get("archived") === "true";

    const query: any = { userId: authUser.id };
    
    if (!includeArchived) {
      query.archived = false;
    }

    const notes = await Note.find(query)
      .sort({ updatedAt: -1 })
      .lean();
    return NextResponse.json(
      {
        success: true,
        count: notes.length,
        notes,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("CRITICAL_FETCH_NOTES_ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}

