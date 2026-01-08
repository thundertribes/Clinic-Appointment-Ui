import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    // 🔎 DEBUG: env check
    const BACKEND_URL = process.env.BACKEND_URL;
    console.log("BACKEND_URL =", BACKEND_URL);

    if (!BACKEND_URL) {
      return NextResponse.json(
        { success: false, message: "BACKEND_URL not defined" },
        { status: 500 }
      );
    }

    // 🔎 DEBUG: request body
    const body = await req.json();
    console.log("LOGIN BODY =", body);

    // 🔁 Call backend login
    const backendRes = await fetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    console.log("BACKEND STATUS =", backendRes.status);

    const data = await backendRes.json();
    console.log("BACKEND RESPONSE =", data);

    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status });
    }

    // ✅ Extract token
    const token = data?.data?.token;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token missing from backend response" },
        { status: 500 }
      );
    }

 const cookieStore = await cookies();

cookieStore.set({
  name: "accessToken",
  value: token,
  httpOnly: true,
  secure: false, // true in prod (https)
  sameSite: "lax",
  path: "/",
});

    return NextResponse.json(
      {
        success: true,
        user: data.data.user, // pass user to FE if needed
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("LOGIN ROUTE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
