import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

// GET /api/clinic/exceptions - Fetch clinic exceptions (holidays & special hours)
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

    // Call backend to get exceptions
    const backendRes = await fetch(`${BACKEND_URL}/clinic/exceptions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("GET EXCEPTIONS ERROR:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// POST /api/clinic/exceptions - Create a new exception (holiday or special hour)
export async function POST(req: Request) {
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

    // Get request body
    const body = await req.json();
    //console.log("CREATE EXCEPTION BODY:", body);

    // Call backend to create exception
    const backendRes = await fetch(`${BACKEND_URL}/clinic/exceptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();
    //console.log("Backend response:", data);

    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("CREATE EXCEPTION ERROR:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
