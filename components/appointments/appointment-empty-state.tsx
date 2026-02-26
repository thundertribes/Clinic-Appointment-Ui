import { Calendar, Check, Clock, X } from "lucide-react";
import type { AppointmentView } from "@/types/appointment";

interface AppointmentEmptyStateProps {
  view: AppointmentView;
}

export function AppointmentEmptyState({ view }: AppointmentEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      {view === "all" && (
        <>
          <Calendar className="h-12 w-12 text-muted-foreground mb-2" />
          <h3 className="text-lg font-semibold">No appointments</h3>
          <p className="text-muted-foreground">There are no appointments to display.</p>
        </>
      )}
      {view === "upcoming" && (
        <>
          <Calendar className="h-12 w-12 text-muted-foreground mb-2" />
          <h3 className="text-lg font-semibold">No upcoming appointments</h3>
          <p className="text-muted-foreground">There are no upcoming appointments scheduled.</p>
        </>
      )}
      {view === "today" && (
        <>
          <Clock className="h-12 w-12 text-muted-foreground mb-2" />
          <h3 className="text-lg font-semibold">No appointments today</h3>
          <p className="text-muted-foreground">There are no appointments scheduled for today.</p>
        </>
      )}
      {view === "completed" && (
        <>
          <Check className="h-12 w-12 text-muted-foreground mb-2" />
          <h3 className="text-lg font-semibold">No completed appointments</h3>
          <p className="text-muted-foreground">There are no completed appointments to display.</p>
        </>
      )}
      {view === "cancelled" && (
        <>
          <X className="h-12 w-12 text-muted-foreground mb-2" />
          <h3 className="text-lg font-semibold">No cancelled appointments</h3>
          <p className="text-muted-foreground">There are no cancelled appointments to display.</p>
        </>
      )}
    </div>
  );
}
