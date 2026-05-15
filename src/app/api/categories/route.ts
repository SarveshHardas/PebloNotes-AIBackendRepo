import { NextResponse } from "next/server";
import { z } from "zod";
import dbConnect from "@/lib/db";
import Category from "@/models/Category";
import { getAuthUser } from "@/lib/auth";

const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .max(30),
});

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

    const validation = createCategorySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, error: "Invalid category name" }, { status: 400 });
    }

    const { name } = validation.data;

    let category = await Category.findOne({ name, userId: authUser.id });
    if (!category) {
      category = await Category.create({ name, userId: authUser.id });
    }

    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error("CATEGORY_CREATE_ERROR:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const categories = await Category.find({ userId: authUser.id }).sort({ name: 1 });

    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error("CATEGORY_FETCH_ERROR:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
