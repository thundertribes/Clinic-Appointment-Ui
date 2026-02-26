import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL;

// GET /api/appointments/[id]/slots?date=YYYY-MM-DD&duration=15|30
// Here [id] is the doctorId used in the backend URL pattern
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!BACKEND_URL) {
      return NextResponse.json(
        { success: false, message: "BACKEND_URL not defined" },
        { status: 500 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - No token found" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const duration = searchParams.get("duration");

    if (!date || !duration) {
      return NextResponse.json(
        { success: false, message: "Missing required query params: date, duration" },
        { status: 400 }
      );
    }

    const backendUrl = new URL(`${BACKEND_URL}/appointments/${id}/slots`);
    backendUrl.searchParams.set("date", date);
    backendUrl.searchParams.set("duration", duration);

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
    console.error("GET SLOTS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
