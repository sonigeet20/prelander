import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // TODO: Add auth checks once NextAuth is fully configured with database
  // For now, let individual route handlers manage authentication
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
