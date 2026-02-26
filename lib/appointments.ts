import "server-only";

import { cookies } from "next/headers";
import type {
  Appointment,
  AppointmentDetail,
  AppointmentDetailResponse,
  AppointmentMeta,
  AppointmentsResponse,
} from "@/types/appointment";

const BACKEND_URL = process.env.BACKEND_URL;

export async function getAppointments(): Promise<{
  appointments: Appointment[];
  meta: AppointmentMeta | null;
  error: string | null;
}> {
  try {
    if (!BACKEND_URL) {
      return { appointments: [], meta: null, error: "Backend URL not configured" };
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return { appointments: [], meta: null, error: "Unauthorized - Please login" };
    }

    const response = await fetch(`${BACKEND_URL}/appointments`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        appointments: [],
        meta: null,
        error: errorData.message || `Failed to fetch appointments (${response.status})`,
      };
    }

    const apiResponse: AppointmentsResponse = await response.json();

    return {
      appointments: apiResponse.data?.appointments || [],
      meta: apiResponse.data?.meta || null,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return { appointments: [], meta: null, error: "Failed to fetch appointments" };
  }
}

export async function getAppointment(id: string): Promise<{
  appointment: AppointmentDetail | null;
  error: string | null;
}> {
  try {
    if (!BACKEND_URL) {
      return { appointment: null, error: "Backend URL not configured" };
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return { appointment: null, error: "Unauthorized - Please login" };
    }

    const response = await fetch(`${BACKEND_URL}/appointments/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        appointment: null,
        error: errorData.message || `Failed to fetch appointment (${response.status})`,
      };
    }

    const apiResponse: AppointmentDetailResponse = await response.json();

    return {
      appointment: apiResponse.data || null,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching appointment:", error);
    return { appointment: null, error: "Failed to fetch appointment" };
  }
}
