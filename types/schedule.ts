export interface DaySchedule {
  dayOfWeek: number; // 1 = Monday, 2 = Tuesday, ..., 7 = Sunday
  dayName: string; // "Monday", "Tuesday", etc.
  startTime: string; // "09:00"
  endTime: string; // "18:00"
}

export interface ClinicScheduleResponse {
  success: boolean;
  message: string;
  data: DaySchedule[];
}

export interface UpdateScheduleRequest {
  schedule: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>;
}
