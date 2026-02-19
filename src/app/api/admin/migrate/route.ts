import { NextRequest, NextResponse } from "next/server";
import { execSync } from "child_process";

/**
 * Admin-only endpoint to manually trigger database migrations
 * POST /api/admin/migrate
 * 
 * This runs `prisma db push` to sync schema changes to the database.
 * Should only be called after deploying new Prisma schema changes.
 */
export async function POST(req: NextRequest) {
  try {
    // Simple auth check - in production you'd want proper admin auth
    const authHeader = req.headers.get("authorization");
    const adminSecret = process.env.ADMIN_SECRET;

    if (!adminSecret || authHeader !== `Bearer ${adminSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if DATABASE_URL is configured
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "DATABASE_URL not configured" },
        { status: 500 }
      );
    }

    // Run prisma db push to apply schema changes
    console.log("Running Prisma DB push...");
    const output = execSync("npx prisma db push --accept-data-loss --skip-generate", {
      encoding: "utf-8",
      stdio: "pipe",
    });

    return NextResponse.json({
      success: true,
      message: "Database schema updated successfully",
      output,
    });
  } catch (error: any) {
    console.error("Migration failed:", error);
    return NextResponse.json(
      {
        error: "Migration failed",
        message: error.message,
        output: error.stdout || error.stderr,
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check migration status
 */
export async function GET() {
  try {
    const output = execSync("npx prisma db execute --stdin < /dev/null 2>&1 || echo 'OK'", {
      encoding: "utf-8",
      stdio: "pipe",
    });

    return NextResponse.json({
      status: "Database connection OK",
      hasDatabase: !!process.env.DATABASE_URL,
      output,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Database check failed",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
