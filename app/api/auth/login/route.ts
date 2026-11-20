import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { loginSchema } from "@/lib/validators";
import { setSessionCookie } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data login tidak valid" },
        { status: 400 }
      );
    }

    const { username, password } = parsed.data;
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "Username tidak terdaftar" },
        { status: 401 }
      );
    }

    const isBcryptHash = user.password.startsWith("$2");
    const validPassword = isBcryptHash
      ? await bcrypt.compare(password, user.password)
      : password === user.password;

    if (!validPassword) {
      return NextResponse.json({ error: "Password salah" }, { status: 401 });
    }

    const sessionPayload = {
      id_user: user.id_user,
      username: user.username,
      fullname: user.fullname,
      email: user.email,
      role: user.role,
    };

    await setSessionCookie(sessionPayload);

    return NextResponse.json({
      message: "Berhasil login",
      user: sessionPayload,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat login" },
      { status: 500 }
    );
  }
}
