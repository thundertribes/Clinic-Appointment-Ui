import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppointmentToolbar } from "@/components/appointments/appointment-toolbar";
import { AppointmentTabs } from "@/components/appointments/appointment-tabs";
import { AppointmentList } from "@/components/appointments/appointment-list";
import { AppointmentEmptyState } from "@/components/appointments/appointment-empty-state";
import { getAppointments } from "@/lib/appointments";
import type { Appointment, AppointmentView } from "@/types/appointment";

function filterAppointments(appointments: Appointment[], view: AppointmentView): Appointment[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);

  switch (view) {
    case "today":
      return appointments.filter((apt) => {
        const aptDate = new Date(apt.start);
        return aptDate >= today && aptDate <= todayEnd;
      });
    case "upcoming":
      return appointments.filter((apt) => {
        const aptDate = new Date(apt.start);
        return aptDate > todayEnd && apt.status !== "CANCELLED";
      });
    case "completed":
      return appointments.filter((apt) => apt.status === "COMPLETED");
    case "cancelled":
      return appointments.filter((apt) => apt.status === "CANCELLED");
    case "all":
    default:
      return appointments;
  }
}

// Get card title based on view
function getCardTitle(view: AppointmentView): string {
  switch (view) {
    case "all":
      return "All Appointments";
    case "upcoming":
      return "Upcoming Appointments";
    case "today":
      return "Today's Appointments";
    case "completed":
      return "Completed Appointments";
    case "cancelled":
      return "Cancelled Appointments";
    default:
      return "Appointments";
  }
}

// Get card description based on view
function getCardDescription(view: AppointmentView): string {
  switch (view) {
    case "all":
      return "View and manage all scheduled appointments.";
    case "upcoming":
      return "View and manage future scheduled appointments.";
    case "today":
      return "View and manage appointments scheduled for today.";
    case "completed":
      return "View all completed appointments.";
    case "cancelled":
      return "View all cancelled appointments.";
    default:
      return "View and manage appointments.";
  }
}

interface AppointmentsPageProps {
  searchParams: Promise<{ view?: string }>;
}

export default async function AppointmentsPage({ searchParams }: AppointmentsPageProps) {
  const params = await searchParams;
  const view = (params.view as AppointmentView) || "all";
  const { appointments: allAppointments, error } = await getAppointments();
  const appointments = filterAppointments(allAppointments, view);

  return (
    <div className="flex flex-col gap-5">
      <AppointmentToolbar />
      <AppointmentTabs currentView={view} />

      {error && (
        <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md p-3">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{getCardTitle(view)}</CardTitle>
          <CardDescription>{getCardDescription(view)}</CardDescription>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <AppointmentEmptyState view={view} />
          ) : (
            <AppointmentList appointments={appointments} view={view} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
