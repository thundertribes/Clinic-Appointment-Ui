import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CalendarClock,
  CheckCircle2,
  Clock,
  FileText,
  Mail,
  Pencil,
  Phone,
  Stethoscope,
  User,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { getAppointment } from "@/lib/appointments";
import { formatStatus, getStatusBadgeStyles } from "@/types/appointment";

export default async function AppointmentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { appointment, error } = await getAppointment(id);

  if (!appointment) {
    if (error === "Unauthorized - Please login") {
      notFound();
    }
    notFound();
  }

  const startDate = new Date(appointment.start);
  const endDate = new Date(appointment.end);
  const badgeStyles = getStatusBadgeStyles(appointment.status);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "BOOKED":
        return <AlertCircle className="shrink-0 h-5 w-5 text-blue-500" />;
      case "IN_PROGRESS":
        return <Clock className="shrink-0 h-5 w-5 text-amber-500" />;
      case "COMPLETED":
        return <CheckCircle2 className="shrink-0 h-5 w-5 text-green-500" />;
      case "CANCELLED":
        return <XCircle className="shrink-0 h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const patientName = `${appointment.patient.firstName} ${appointment.patient.lastName}`;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="icon" asChild>
            <Link href="/appointments">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to appointments</span>
            </Link>
          </Button>
          <h2 className="text-3xl font-bold leading-tight mb-2">
            Appointment Details
          </h2>
        </div>
        <div className="flex gap-2 flex-wrap">
          {appointment.status !== "CANCELLED" &&
            appointment.status !== "COMPLETED" && (
              <>
                <Button variant="outline" asChild>
                  <Link href={`/appointments/${appointment.id}/reschedule`}>
                    <CalendarClock className="mr-2 h-4 w-4" />
                    Reschedule
                  </Link>
                </Button>
                <Button asChild>
                  <Link href={`/appointments/${appointment.id}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Appointment
                  </Link>
                </Button>
              </>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main appointment info */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                {getStatusIcon(appointment.status)}
                Appointment #{appointment.id}
              </CardTitle>
              <CardDescription>
                Created on{" "}
                {format(new Date(appointment.createdAt), "MMM d, yyyy")}
              </CardDescription>
            </div>
            <Badge variant={badgeStyles.variant} className={badgeStyles.className}>
              {formatStatus(appointment.status)}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="shrink-0 h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Date</h3>
                    <p>
                      {format(startDate, "EEEE, MMMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="shrink-0 h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Time</h3>
                    <p>
                      {format(startDate, "hh:mm a")} -{" "}
                      {format(endDate, "hh:mm a")} (
                      {appointment.durationMinutes} min)
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="shrink-0 h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Booked Via</h3>
                    <p className="capitalize">
                      {appointment.bookedVia.toLowerCase()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {appointment.notes && (
                  <div className="flex items-start gap-3">
                    <FileText className="shrink-0 h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h3 className="font-semibold">Notes</h3>
                      <p className="text-sm">{appointment.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground">
            Last updated:{" "}
            {format(new Date(appointment.updatedAt), "MMM d, yyyy 'at' hh:mm a")}
          </CardFooter>
        </Card>

        {/* Patient and doctor info */}
        <div className="space-y-6">
          {/* Patient info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <User className="h-5 w-5" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="font-semibold text-lg">{patientName}</h3>
              <Separator />
              <div className="space-y-2">
                {appointment.patient.phone && (
                  <div className="grid grid-cols-[20px_1fr] gap-2 items-center">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{appointment.patient.phone}</p>
                  </div>
                )}
                {appointment.patient.email && (
                  <div className="grid grid-cols-[20px_1fr] gap-2 items-center">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{appointment.patient.email}</p>
                  </div>
                )}
              </div>
              <div className="pt-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/patients/${appointment.patient.id}`}>
                    View Patient Record
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Doctor info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Doctor Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">
                  {appointment.doctor.name}
                </h3>
                {appointment.doctor.designation && (
                  <p className="text-sm text-muted-foreground">
                    {appointment.doctor.designation}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
