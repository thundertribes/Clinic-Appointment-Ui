// Appointment types matching API response shape

export interface AppointmentPatient {
  id: string;
  firstName: string;
  lastName: string;
}

export interface AppointmentDoctor {
  id: string;
  name: string;
  designation?: string;
}

export interface Appointment {
  id: string;
  start: string; // ISO datetime
  end: string; // ISO datetime
  durationMinutes: number;
  status: "BOOKED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  type: string | null;
  bookedVia: string;
  notes: string | null;
  patient: AppointmentPatient;
  doctor: AppointmentDoctor;
  createdAt: string;
  updatedAt: string;
}

// Detail response for single appointment (GET /appointments/:id)
export interface AppointmentDetailPatient extends AppointmentPatient {
  email: string | null;
  phone: string | null;
}

export interface AppointmentDetail extends Omit<Appointment, "patient"> {
  patient: AppointmentDetailPatient;
}

export interface AppointmentDetailResponse {
  success: boolean;
  message: string;
  data: AppointmentDetail;
}

export interface AppointmentMeta {
  total: number;
  page: number;
  limit: number;
}

export interface AppointmentsResponse {
  success: boolean;
  message: string;
  data: {
    meta: AppointmentMeta;
    appointments: Appointment[];
  };
}

// View types for filtering
export type AppointmentView = "all" | "upcoming" | "today" | "completed" | "cancelled";

// Status badge styling helper
export function getStatusBadgeStyles(status: Appointment["status"]) {
  switch (status) {
    case "BOOKED":
      return { variant: "outline" as const, className: "border-blue-500 text-blue-500" };
    case "IN_PROGRESS":
      return { variant: "default" as const, className: "bg-amber-500" };
    case "COMPLETED":
      return { variant: "default" as const, className: "bg-green-500" };
    case "CANCELLED":
      return { variant: "destructive" as const, className: "bg-red-500" };
    default:
      return { variant: "outline" as const, className: "" };
  }
}

// Format status for display
export function formatStatus(status: Appointment["status"]): string {
  switch (status) {
    case "BOOKED":
      return "Booked";
    case "IN_PROGRESS":
      return "In Progress";
    case "COMPLETED":
      return "Completed";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status;
  }
}

// Format appointment type for display (capitalize)
export function formatType(type: string | null): string {
  if (!type) return "General";
  return type.charAt(0).toUpperCase() + type.slice(1);
}
