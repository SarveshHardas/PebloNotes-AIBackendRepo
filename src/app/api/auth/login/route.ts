import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { z } from "zod";
import dbConnect from "@/lib/db";
import User from "@/models/User";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Email is required.")
    .email("Please enter a valid email address."),
  password: z
    .string()
    .min(1, "Password is required."),
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

    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      const formattedErrors = validationResult.error.issues.map(
        (issue) => issue.message
      );
      return NextResponse.json(
        { success: false, errors: formattedErrors },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    const user = await User.findOne({ email }).select("+password");
    
    if (!user || !user.password) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 } 
      );
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("CRITICAL_CONFIG_ERROR: JWT_SECRET is undefined in environment.");
      return NextResponse.json(
        { success: false, error: "Server configuration error." },
        { status: 500 }
      );
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      jwtSecret,
      {
        expiresIn: "7d", 
      }
    );

    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production", 
      sameSite: "strict", 
      maxAge: 7 * 24 * 60 * 60, 
      path: "/", 
    });

    return NextResponse.json(
      {
        success: true,
        message: "Logged in successfully.",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("CRITICAL_LOGIN_ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
