import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

// DELETE /api/clinic/exceptions/[id] - Delete a clinic exception
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

    // Get the exception ID from params
    const { id } = await params;
    //console.log("DELETE EXCEPTION ID:", id);

    // Call backend to delete exception
    const backendRes = await fetch(`${BACKEND_URL}/clinic/exceptions/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await backendRes.json();
    //console.log("Delete response:", data);

    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("DELETE EXCEPTION ERROR:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
