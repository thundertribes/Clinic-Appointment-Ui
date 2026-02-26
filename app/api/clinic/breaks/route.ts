import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

// GET /api/clinic/breaks - Fetch all clinic breaks
export async function GET() {
  try {
    if (!BACKEND_URL) {
      return NextResponse.json({ success: false, message: "BACKEND_URL not defined" }, { status: 500 });
    }

    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized - No token found" }, { status: 401 });
    }

    // Call backend to get clinic breaks
    const backendRes = await fetch(`${BACKEND_URL}/clinic/breaks`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("GET CLINIC BREAKS ERROR:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
