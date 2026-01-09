export interface ClinicException {
  id: string;
  date: string; // "2026-01-28"
  isClosed: boolean; // true for holidays, false for special hours
  startTime?: string; // "09:00" (only for special hours)
  endTime?: string; // "12:00" (only for special hours)
  reason: string; // "Republic Day", "Early Closing", etc.
}

export interface ClinicExceptionsResponse {
  success: boolean;
  message: string;
  data: ClinicException[];
}

export interface CreateExceptionRequest {
  date: string;
  isClosed: boolean;
  startTime?: string;
  endTime?: string;
  reason: string;
}

export interface DeleteExceptionResponse {
  success: boolean;
  message: string;
}
