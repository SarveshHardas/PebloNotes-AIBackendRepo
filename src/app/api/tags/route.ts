import { NextResponse } from "next/server";
import { z } from "zod";
import dbConnect from "@/lib/db";
import Tag from "@/models/Tag";
import { getAuthUser } from "@/lib/auth";

const createTagSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .max(20)
    .transform((val) => val.toLowerCase()),
});

// 🏷️ POST: Fetch or Create Tag (Ensures no duplicates)
export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid body" }, { status: 400 });
    }

    const validation = createTagSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, error: "Invalid tag name" }, { status: 400 });
    }

    const { name } = validation.data;

    // Perform an upsert-like operation scoped to active user
    let tag = await Tag.findOne({ name, userId: authUser.id });
    if (!tag) {
      tag = await Tag.create({ name, userId: authUser.id });
    }

    return NextResponse.json({ success: true, tag });
  } catch (error) {
    console.error("TAG_CREATE_ERROR:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// 🏷️ GET: Fetch all tags for active user
export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const tags = await Tag.find({ userId: authUser.id }).sort({ name: 1 });

    return NextResponse.json({ success: true, tags });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
