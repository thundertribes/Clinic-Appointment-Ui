import "server-only";

import { cookies } from "next/headers";
import type { Patient, PatientFilterOptions, PatientsApiResponse } from "@/types/patient";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Server-side function to fetch patients
 * Can only be called from Server Components or Server Actions
 */
export async function getPatients(): Promise<{
  patients: Patient[];
  filterOptions: PatientFilterOptions;
  error: string | null;
}> {
  try {
    if (!BACKEND_URL) {
      return {
        patients: [],
        filterOptions: { genders: [], doctors: [] },
        error: "Backend URL not configured",
      };
    }

    // Get token from cookies (server-side)
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return {
        patients: [],
        filterOptions: { genders: [], doctors: [] },
        error: "Unauthorized - Please login",
      };
    }

    // Fetch patients from backend
    const response = await fetch(`${BACKEND_URL}/patients`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      // Don't cache - always get fresh data
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        patients: [],
        filterOptions: { genders: [], doctors: [] },
        error: errorData.message || `Failed to fetch patients (${response.status})`,
      };
    }

    // Backend returns { success, message, data } - extract data array
    const apiResponse: PatientsApiResponse = await response.json();
    const patients: Patient[] = apiResponse.data || [];

    // Extract unique filter options from the data
    const filterOptions: PatientFilterOptions = {
      genders: [...new Set(patients.map((p) => p.gender).filter(Boolean))] as string[],
      doctors: [...new Set(patients.map((p) => p.doctor?.name).filter(Boolean))] as string[],
    };

    return {
      patients,
      filterOptions,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching patients:", error);
    return {
      patients: [],
      filterOptions: { genders: [], doctors: [] },
      error: "Failed to fetch patients",
    };
  }
}
