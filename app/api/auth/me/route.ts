import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function GET() {
  const cookieStore = await cookies(); // ✅ await
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return NextResponse.json({ success: false, message: "No token" }, { status: 401 });
  }

  const backendRes = await fetch(`${BACKEND_URL}/auth/me`, {
    headers: {
      authorization: `Bearer ${token}`, // lowercase ✔️
    },
  });

  const data = await backendRes.json();

  return NextResponse.json(data, {
    status: backendRes.status,
  });
}
