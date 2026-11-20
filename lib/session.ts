import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "abnews_session";

function getSecretKey(): Uint8Array {
  const secret =
    process.env.SESSION_SECRET ??
    "abnews-dev-secret-key-please-change-in-production-32chars";
  return new TextEncoder().encode(secret);
}

export interface SessionPayload {
  id_user: number;
  username: string;
  fullname: string;
  email: string;
  role: string;
}

export async function createSessionToken(
  payload: SessionPayload
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (
      typeof payload.id_user === "number" &&
      typeof payload.username === "string"
    ) {
      return {
        id_user: payload.id_user,
        username: payload.username,
        fullname: String(payload.fullname ?? payload.username),
        email: String(payload.email ?? ""),
        role: String(payload.role ?? "admin"),
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function setSessionCookie(payload: SessionPayload) {
  const token = await createSessionToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
