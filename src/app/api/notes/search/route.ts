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
    const tag = searchParams.get("tag");
    const category = searchParams.get("category");
    const sort = searchParams.get("sort") || "updatedAt_desc";

    if (!query.trim()) {
      return NextResponse.json({ success: true, notes: [] });
    }

    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const searchQuery: any = {
      userId: authUser.id,
      archived: isArchived,
      $or: [
        { title: { $regex: escapedQuery, $options: "i" } },
        { content: { $regex: escapedQuery, $options: "i" } },
      ],
    };

    if (tag) searchQuery.tags = tag;
    if (category) searchQuery.category = category === "none" ? null : category;

    let sortObj: any = { updatedAt: -1 };
    if (sort === "updatedAt_desc") sortObj = { updatedAt: -1 };
    else if (sort === "updatedAt_asc") sortObj = { updatedAt: 1 };
    else if (sort === "title_asc") sortObj = { title: 1 };
    else if (sort === "title_desc") sortObj = { title: -1 };

    const notes = await Note.find(searchQuery)
      .sort(sortObj)
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
