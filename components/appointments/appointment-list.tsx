import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AppointmentRow } from "./appointment-row";
import type { Appointment, AppointmentView } from "@/types/appointment";

interface AppointmentListProps {
  appointments: Appointment[];
  view: AppointmentView;
}

export function AppointmentList({ appointments, view }: AppointmentListProps) {
  return (
    <Table className="whitespace-nowrap">
      <TableHeader>
        <TableRow>
          <TableHead>Patient</TableHead>
          <TableHead className="table-cell">Doctor</TableHead>
          <TableHead>{view === "today" ? "Time" : "Date & Time"}</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="table-cell">Type</TableHead>
          <TableHead className="table-cell">Duration</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="whitespace-nowrap">
        {appointments.map((appointment) => (
          <AppointmentRow key={appointment.id} appointment={appointment} view={view} />
        ))}
      </TableBody>
    </Table>
  );
}
