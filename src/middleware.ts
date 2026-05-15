import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PROTECTED_ROUTES = ["/dashboard", "/notes", "/workspace"];
const AUTH_ROUTES = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  const { nextUrl, cookies } = request;
  const path = nextUrl.pathname;

  const token = cookies.get("token")?.value;

  let isAuthenticated = false;
  if (token) {
    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || ""
      );
      
      await jwtVerify(token, secret);
      isAuthenticated = true;
    } catch (error) {
      isAuthenticated = false;
    }
  }
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    path.startsWith(route)
  );
  const isAuthRoute = AUTH_ROUTES.some((route) =>
    path.startsWith(route)
  );
  
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", path);
    
    const response = NextResponse.redirect(loginUrl);
    if (token) {
      response.cookies.delete("token");
    }
    return response;
  }
  
  return NextResponse.next();
}
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
};
