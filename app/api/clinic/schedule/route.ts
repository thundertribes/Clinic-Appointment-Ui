import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL;

// GET /api/clinic/schedule - Fetch clinic schedule
export async function GET() {
  try {
    if (!BACKEND_URL) {
      return NextResponse.json(
        { success: false, message: "BACKEND_URL not defined" },
        { status: 500 }
      );
    }

    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - No token found" },
        { status: 401 }
      );
    }

    // Call backend to get schedule
    const backendRes = await fetch(`${BACKEND_URL}/clinic/schedule`, {
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
    console.error("GET SCHEDULE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/clinic/schedule - Update clinic schedule
export async function PUT(req: Request) {
  try {
    if (!BACKEND_URL) {
      return NextResponse.json(
        { success: false, message: "BACKEND_URL not defined" },
        { status: 500 }
      );
    }

    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - No token found" },
        { status: 401 }
      );
    }

    // Get request body
    const body = await req.json();
    console.log("UPDATE SCHEDULE BODY:", body);
    console.log("BACKEND_URL:", BACKEND_URL);
    console.log("Token exists:", !!token);

    // Call backend to update schedule
    const backendRes = await fetch(`${BACKEND_URL}/clinic/schedule`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    console.log("Backend response status:", backendRes.status);

    const data = await backendRes.json();
    console.log("Backend response data:", data);

    if (!backendRes.ok) {
      console.error("Backend error:", data);
      return NextResponse.json(data, { status: backendRes.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("UPDATE SCHEDULE ERROR:", error);
    console.error("Error details:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { success: false, message: "Internal server error", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
