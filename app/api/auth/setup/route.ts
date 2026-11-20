import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hasAnyUsers } from "@/lib/data";
import { setupAdminSchema } from "@/lib/validators";
import { setSessionCookie } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const exists = await hasAnyUsers();
    if (exists) {
      return NextResponse.json(
        { error: "Setup awal sudah selesai. Silakan login." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = setupAdminSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(parsed.data.password, 10);
    const [inserted] = await db
      .insert(users)
      .values({
        username: parsed.data.username,
        fullname: parsed.data.fullname,
        email: parsed.data.email,
        password: hashedPassword,
        role: "admin",
      })
      .returning({ id_user: users.id_user });

    const sessionPayload = {
      id_user: inserted.id_user,
      username: parsed.data.username,
      fullname: parsed.data.fullname,
      email: parsed.data.email,
      role: "admin",
    };

    await setSessionCookie(sessionPayload);

    return NextResponse.json(
      { message: "Akun admin pertama berhasil dibuat", user: sessionPayload },
      { status: 201 }
    );
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { error: "Gagal membuat akun admin" },
      { status: 500 }
    );
  }
}
