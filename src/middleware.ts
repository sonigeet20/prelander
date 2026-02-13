import { NextRequest, NextResponse } from "next/server";

const clickIdParams = ["gclid", "gbraid", "wbraid"] as const;

function getSubdomain(hostname: string): string | null {
  if (hostname.includes("localhost") || hostname.endsWith(".local")) {
    return null;
  }
  const parts = hostname.split(".");
  if (parts.length < 3) {
    return null;
  }
  return parts[0] || null;
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const response = NextResponse.next();

  for (const param of clickIdParams) {
    const value = url.searchParams.get(param);
    if (value) {
      response.cookies.set(param, value, {
        httpOnly: false,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
      });
    }
  }

  const subdomain = getSubdomain(request.nextUrl.hostname);
  if (subdomain && !url.pathname.startsWith("/offer/")) {
    url.pathname = `/offer/${subdomain}/default`;
    return NextResponse.rewrite(url, { headers: response.headers });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};
