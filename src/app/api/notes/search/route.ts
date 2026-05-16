import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Note from "@/models/Note";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access." },
        { status: 401 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const isArchived = searchParams.get("archived") === "true";

    if (!query.trim()) {
      return NextResponse.json({ success: true, notes: [] });
    }

    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const searchQuery = {
      userId: authUser.id,
      archived: isArchived,
      $or: [
        { title: { $regex: escapedQuery, $options: "i" } },
        { content: { $regex: escapedQuery, $options: "i" } },
      ],
    };

    const notes = await Note.find(searchQuery)
      .sort({ updatedAt: -1 })
      .populate("tags")
      .populate("category")
      .lean();

    return NextResponse.json({
      success: true,
      notes,
    });
  } catch (error) {
    console.error("SEARCH_NOTES_ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to search notes." },
      { status: 500 }
    );
  }
}
