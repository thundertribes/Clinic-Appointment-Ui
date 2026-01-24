import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar, Clock, Phone, Mail, Stethoscope, Droplets, Ruler, Weight } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

const BACKEND_URL = process.env.BACKEND_URL;

// Type definitions matching the API response
interface Doctor {
  id: string;
  name: string;
}

interface Patient {
  id: string;
  publicId: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  phoneNumber: string;
  doctor: Doctor;
  email?: string;
  bloodType?: string;
  heightCm?: number;
  weightKg?: number;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  type: string;
  status: string;
  notes?: string;
}

// Fetch patient data server-side
async function getPatient(id: string): Promise<Patient | null> {
  if (!BACKEND_URL) {
    console.error("BACKEND_URL not defined");
    return null;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/patients/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching patient:", error);
    return null;
  }
}

// Fetch patient appointments server-side
async function getPatientAppointments(patientId: string): Promise<Appointment[]> {
  if (!BACKEND_URL) {
    return [];
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return [];
  }

  try {
    const response = await fetch(`${BACKEND_URL}/patients/${patientId}/appointments`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return [];
  }
}

export default async function PatientDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const patient = await getPatient(id);

  if (!patient) {
    notFound();
  }

  const appointments = await getPatientAppointments(id);
  const fullName = `${patient.firstName} ${patient.lastName}`;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4 flex-wrap">
        <Button variant="outline" size="icon" asChild>
          <Link href="/patients">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mb-2">Patient Details</h1>
          <p className="text-muted-foreground">View patient information.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Patient Profile Card */}
        <Card className="lg:w-1/3">
          <CardHeader className="pb-2">
            <CardTitle>Patient Profile</CardTitle>
            <CardDescription>ID: {patient.publicId}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center text-center">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-muted-foreground">
                  {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                </span>
              </div>
              <h2 className="text-xl font-bold">{fullName}</h2>
              <p className="text-muted-foreground">
                {patient.age} years • {patient.gender}
              </p>
              {patient.bloodType && (
                <Badge variant="outline" className="mt-2 border-blue-500 text-blue-500">
                  {patient.bloodType}
                </Badge>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              {/* Contact Information */}
              <div className="space-y-3">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Contact</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{patient.phoneNumber}</span>
                  </div>
                  {patient.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{patient.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Assigned Doctor */}
              <div className="space-y-3">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Assigned Doctor</h3>
                <div className="flex items-center gap-2 text-sm">
                  <Stethoscope className="h-4 w-4 text-muted-foreground" />
                  <span>{patient.doctor.name}</span>
                </div>
              </div>

              <Separator />

              {/* Medical Information */}
              <div className="space-y-3">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Medical Info</h3>
                <div className="grid grid-cols-2 gap-3">
                  {patient.bloodType && (
                    <div className="flex items-center gap-2 text-sm">
                      <Droplets className="h-4 w-4 text-muted-foreground" />
                      <span>Blood: {patient.bloodType}</span>
                    </div>
                  )}
                  {patient.heightCm && (
                    <div className="flex items-center gap-2 text-sm">
                      <Ruler className="h-4 w-4 text-muted-foreground" />
                      <span>{patient.heightCm} cm</span>
                    </div>
                  )}
                  {patient.weightKg && (
                    <div className="flex items-center gap-2 text-sm">
                      <Weight className="h-4 w-4 text-muted-foreground" />
                      <span>{patient.weightKg} kg</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patient Details Tabs */}
        <div className="flex-1">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Appointments</CardTitle>
                  <CardDescription>Latest appointments for this patient.</CardDescription>
                </CardHeader>
                <CardContent>
                  {appointments.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No appointments found.</p>
                  ) : (
                    <div className="space-y-3">
                      {appointments.slice(0, 5).map((appointment) => (
                        <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-md flex-wrap gap-3">
                          <div className="flex items-start gap-3">
                            <div className={`h-2 w-2 mt-2 rounded-full ${
                              appointment.status === "SCHEDULED" ? "bg-blue-500" :
                              appointment.status === "COMPLETED" ? "bg-green-500" :
                              appointment.status === "CANCELLED" ? "bg-red-500" : "bg-amber-500"
                            }`} />
                            <div>
                              <p className="font-medium">{appointment.type}</p>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Calendar className="mr-1 h-3 w-3" />
                                {appointment.date}
                                <Clock className="ml-2 mr-1 h-3 w-3" />
                                {appointment.time}
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant={appointment.status === "SCHEDULED" ? "outline" : "default"}
                            className={
                              appointment.status === "SCHEDULED" ? "border-blue-500 text-blue-500" :
                              appointment.status === "COMPLETED" ? "bg-green-500" :
                              appointment.status === "CANCELLED" ? "bg-red-500" : "bg-amber-500"
                            }
                          >
                            {appointment.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appointments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Appointment History</CardTitle>
                  <CardDescription>All appointments for this patient.</CardDescription>
                </CardHeader>
                <CardContent>
                  {appointments.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No appointments found.</p>
                  ) : (
                    <Table className="whitespace-nowrap">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="whitespace-nowrap">
                        {appointments.map((appointment) => (
                          <TableRow key={appointment.id}>
                            <TableCell>
                              <div>
                                <p>{appointment.date}</p>
                                <p className="text-sm text-muted-foreground">{appointment.time}</p>
                              </div>
                            </TableCell>
                            <TableCell>{appointment.type}</TableCell>
                            <TableCell>
                              <Badge
                                variant={appointment.status === "SCHEDULED" ? "outline" : "default"}
                                className={
                                  appointment.status === "SCHEDULED" ? "border-blue-500 text-blue-500" :
                                  appointment.status === "COMPLETED" ? "bg-green-500" :
                                  appointment.status === "CANCELLED" ? "bg-red-500" : "bg-amber-500"
                                }
                              >
                                {appointment.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {appointment.notes || "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
