import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("CRITICAL: JWT_SECRET is not defined.");
      return null;
    }

    const decoded = jwt.verify(token, jwtSecret) as AuthUser;
    
    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
    };
  } catch (error) {
    return null;
  }
}
