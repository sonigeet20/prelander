import { NextResponse } from "next/server";

/**
 * Middleware — minimal pass-through.
 *
 * Previously captured Google Ads click IDs (gclid/gbraid/wbraid) into cookies
 * for conversion tracking. Removed to comply with Google Ads policies —
 * no hidden parameter harvesting or cookie stuffing.
 */
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};
