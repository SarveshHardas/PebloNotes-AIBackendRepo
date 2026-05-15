import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import dbConnect from "@/lib/db";
import User from "@/models/User";

const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Email is required.")
    .email("Please enter a valid email address."),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters."),
});

export async function POST(req: Request) {
  try {
    await dbConnect();

    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json(
        { success: false, error: "Invalid request body. Expected JSON." },
        { status: 400 }
      );
    }

    const validationResult = signupSchema.safeParse(body);
    if (!validationResult.success) {
      const formattedErrors = validationResult.error.issues.map(
        (issue) => issue.message
      );
      return NextResponse.json(
        { success: false, errors: formattedErrors },
        { status: 400 }
      );
    }

    const { name, email, password } = validationResult.data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists." },
        { status: 409 } 
      );
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully.",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          createdAt: newUser.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val: any) => val.message);
      return NextResponse.json(
        { success: false, errors: messages },
        { status: 400 }
      );
    }

    console.error("CRITICAL_SIGNUP_ERROR:", error);
    
    return NextResponse.json(
      { success: false, error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
