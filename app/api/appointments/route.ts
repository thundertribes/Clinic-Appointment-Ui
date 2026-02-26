import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL;

// GET /api/appointments - Fetch appointments with optional view filter
export async function GET(request: NextRequest) {
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

    // Get query params from the request URL
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view") || "all";

    // Build backend URL with query params
    const backendUrl = new URL(`${BACKEND_URL}/appointments`);
    backendUrl.searchParams.set("view", view);

    // Call backend to get appointments
    const backendRes = await fetch(backendUrl.toString(), {
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
    console.error("GET APPOINTMENTS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/appointments - Create a new appointment
export async function POST(request: NextRequest) {
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
    const body = await request.json();

    // Call backend to create appointment
    const backendRes = await fetch(`${BACKEND_URL}/appointments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("POST APPOINTMENT ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
