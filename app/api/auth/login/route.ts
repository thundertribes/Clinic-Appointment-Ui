import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = "http://localhost:5001";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const backendRes = await fetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!backendRes.ok) {
      const error = await backendRes.json();
      return NextResponse.json(
        { success: false, message: error.message || "Login failed" },
        { status: backendRes.status }
      );
    }

    const result = await backendRes.json();
    const token = result?.data?.token;
    const user = result?.data?.user;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token missing from backend response" },
        { status: 500 }
      );
    }

    const cookieStore = await cookies();

    cookieStore.set("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
