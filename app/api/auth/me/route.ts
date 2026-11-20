import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { hasAnyUsers } from "@/lib/data";

export async function GET() {
  const session = await getSession();
  const hasUsers = await hasAnyUsers();
  return NextResponse.json({
    authenticated: Boolean(session),
    user: session,
    needsSetup: !hasUsers,
  });
}
