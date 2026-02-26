"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Clock, Search } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo, FormEvent } from "react";
import { useRouter } from "next/navigation";

// --- Interfaces matching real backend API ---

interface PatientOption {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  phoneNumber?: string;
  email?: string;
}

interface DoctorOption {
  id: string;
  name: string;
  number: string;
  designation: string;
}

interface SlotOption {
  startTime: string;
  endTime: string;
  slotIds: string[];
  duration: number;
}

// Only 2 appointment types
const APPOINTMENT_TYPES = [
  { id: "checkup", name: "Check-up", duration: 30 },
  { id: "followup", name: "Follow-up", duration: 15 },
] as const;

export default function AddAppointmentPage() {
  const router = useRouter();

  // --- Data from API ---
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [availableSlots, setAvailableSlots] = useState<SlotOption[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // --- Form state ---
  const [selectedPatient, setSelectedPatient] = useState<PatientOption | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorOption | null>(null);
  const [appointmentType, setAppointmentType] = useState("");
  const [appointmentDate, setAppointmentDate] = useState<Date | undefined>();
  const [selectedSlot, setSelectedSlot] = useState<SlotOption | null>(null);
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [patientSearchTerm, setPatientSearchTerm] = useState("");
  const [patientPopoverOpen, setPatientPopoverOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Derive duration from appointment type
  const duration = useMemo(() => {
    const type = APPOINTMENT_TYPES.find((t) => t.id === appointmentType);
    return type?.duration ?? null;
  }, [appointmentType]);

  // Check if all required fields are filled for submit button
  const isFormValid =
    selectedPatient !== null &&
    selectedDoctor !== null &&
    appointmentType !== "" &&
    appointmentDate !== undefined &&
    selectedSlot !== null;

  // --- Fetch patients on mount ---
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch("/api/patients", { credentials: "include" });
        if (res.ok) {
          const json = await res.json();
          setPatients(json.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch patients:", error);
      }
    };
    fetchPatients();
  }, []);

  // --- Fetch doctors on mount ---
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch("/api/doctors", { credentials: "include" });
        if (res.ok) {
          const json = await res.json();
          setDoctors(json.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
      }
    };
    fetchDoctors();
  }, []);

  // --- Fetch available slots when doctor + date + type are all selected ---
  useEffect(() => {
    if (!selectedDoctor || !appointmentDate || !duration) {
      setAvailableSlots([]);
      return;
    }

    const fetchSlots = async () => {
      setIsLoadingSlots(true);
      setSelectedSlot(null);
      const dateString = appointmentDate.toISOString().split("T")[0];
      try {
        const res = await fetch(
          `/api/appointments/${selectedDoctor.id}/slots?date=${dateString}&duration=${duration}`,
          { credentials: "include" }
        );
        if (res.ok) {
          const json = await res.json();
          setAvailableSlots(json.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch slots:", error);
      } finally {
        setIsLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [selectedDoctor, appointmentDate, duration]);

  // --- Client-side patient filtering ---
  const filteredPatients = useMemo(() => {
    if (patientSearchTerm.length < 1) return patients;
    const term = patientSearchTerm.toLowerCase();
    return patients.filter(
      (p) =>
        p.firstName.toLowerCase().includes(term) ||
        p.lastName.toLowerCase().includes(term)
    );
  }, [patients, patientSearchTerm]);

  // --- Submit ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    if (!selectedPatient) errors.patient = "Please select a patient";
    if (!selectedDoctor) errors.doctor = "Please select a doctor";
    if (!appointmentType) errors.type = "Please select an appointment type";
    if (!appointmentDate) errors.date = "Please select a date";
    if (!selectedSlot) errors.time = "Please select a time slot";
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    const appointmentData = {
      patientId: selectedPatient!.id,
      doctorId: selectedDoctor!.id,
      slotIds: selectedSlot!.slotIds.map(Number),
      durationMinutes: duration,
      notes: notes || reason || undefined,
      bookedVia: "RECEPTION",
    };

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(appointmentData),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Failed to schedule appointment.");
      }
      router.push("/appointments");
    } catch (err) {
      setFormErrors({
        submit: err instanceof Error ? err.message : "An unknown error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center flex-wrap gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/appointments">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mb-2">Add Appointment</h1>
          <p className="text-muted-foreground">Schedule a new appointment for a patient.</p>
        </div>
      </div>

      {formErrors.submit && (
        <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md p-3">
          {formErrors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column — Appointment Details */}
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Appointment Details</CardTitle>
              <CardDescription>Enter the details for the new appointment.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {/* Appointment Type */}
                <div className="space-y-2">
                  <Label htmlFor="appointment-type">Appointment Type</Label>
                  <Select
                    value={appointmentType}
                    onValueChange={(val) => {
                      setAppointmentType(val);
                      setSelectedSlot(null);
                      setAvailableSlots([]);
                    }}
                  >
                    <SelectTrigger id="appointment-type" className={formErrors.type ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select appointment type" />
                    </SelectTrigger>
                    <SelectContent>
                      {APPOINTMENT_TYPES.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name} ({type.duration} min)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.type && <p className="text-xs text-red-500 mt-1">{formErrors.type}</p>}
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${formErrors.date ? "border-red-500" : ""}`}
                      >
                        <span>{appointmentDate ? appointmentDate.toDateString() : "Pick a date"}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={appointmentDate}
                        onSelect={(date) => {
                          setAppointmentDate(date);
                          setSelectedSlot(null);
                          setAvailableSlots([]);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  {formErrors.date && <p className="text-xs text-red-500 mt-1">{formErrors.date}</p>}
                </div>

                {/* Time Slot */}
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Select
                    value={selectedSlot ? `${selectedSlot.startTime}-${selectedSlot.endTime}` : ""}
                    onValueChange={(val) => {
                      const slot = availableSlots.find((s) => `${s.startTime}-${s.endTime}` === val);
                      setSelectedSlot(slot || null);
                    }}
                    disabled={isLoadingSlots || availableSlots.length === 0}
                  >
                    <SelectTrigger id="time" className={formErrors.time ? "border-red-500" : ""}>
                      <SelectValue
                        placeholder={
                          isLoadingSlots
                            ? "Loading slots..."
                            : !selectedDoctor || !appointmentDate || !appointmentType
                              ? "Select doctor, type & date first"
                              : availableSlots.length === 0
                                ? "No slots available"
                                : "Select time slot"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSlots.map((slot) => (
                        <SelectItem key={`${slot.startTime}-${slot.endTime}`} value={`${slot.startTime}-${slot.endTime}`}>
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4" />
                            {slot.startTime} - {slot.endTime}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.time && <p className="text-xs text-red-500 mt-1">{formErrors.time}</p>}
                </div>

                {/* Reason for Visit */}
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Visit</Label>
                  <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Enter the reason for the appointment"
                    className="min-h-[100px]"
                  />
                </div>
              </div>

              <Separator />

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Additional Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes for Staff</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter any additional notes for staff"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/appointments">Cancel</Link>
            </Button>
            <Button type="submit" disabled={!isFormValid || isSubmitting}>
              {isSubmitting ? "Scheduling..." : "Schedule Appointment"}
            </Button>
          </div>
        </div>

        {/* Right column — Patient & Doctor selection */}
        <div className="space-y-5">
          {/* Select Patient */}
          <Card>
            <CardHeader>
              <CardTitle>Select Patient</CardTitle>
              <CardDescription>Search and select a patient for this appointment.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Popover open={patientPopoverOpen} onOpenChange={setPatientPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-between ${formErrors.patient ? "border-red-500" : ""}`}
                  >
                    <span>
                      {selectedPatient
                        ? `${selectedPatient.firstName} ${selectedPatient.lastName}`
                        : "Search patients..."}
                    </span>
                    <Search className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Search by name..."
                      value={patientSearchTerm}
                      onValueChange={setPatientSearchTerm}
                    />
                    <CommandList>
                      {filteredPatients.length === 0 && patientSearchTerm.length > 0 && (
                        <CommandEmpty>No patients found.</CommandEmpty>
                      )}
                      <CommandGroup>
                        {filteredPatients.map((patient) => (
                          <CommandItem
                            key={patient.id}
                            value={patient.id}
                            onSelect={() => {
                              setSelectedPatient(patient);
                              setPatientPopoverOpen(false);
                              setPatientSearchTerm("");
                            }}
                          >
                            <span className="text-sm">{patient.firstName} {patient.lastName}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {formErrors.patient && <p className="text-xs text-red-500 mt-1">{formErrors.patient}</p>}

              {selectedPatient && (
                <div className="p-4 border rounded-md">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{selectedPatient.firstName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {selectedPatient.firstName} {selectedPatient.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">Age: {selectedPatient.age}</p>
                    </div>
                  </div>
                  <div className="mt-3 text-sm space-y-1">
                    {selectedPatient.phoneNumber && <p>Phone: {selectedPatient.phoneNumber}</p>}
                    {selectedPatient.email && <p>Email: {selectedPatient.email}</p>}
                  </div>
                </div>
              )}

              <Button variant="outline" className="w-full" asChild>
                <Link href="/patients/add">Register New Patient</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Select Doctor */}
          <Card>
            <CardHeader>
              <CardTitle>Select Doctor</CardTitle>
              <CardDescription>Choose a doctor for this appointment.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                onValueChange={(value) => {
                  const doctor = doctors.find((d) => d.id === value);
                  setSelectedDoctor(doctor || null);
                  setSelectedSlot(null);
                  setAvailableSlots([]);
                }}
              >
                <SelectTrigger className={formErrors.doctor ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select a doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.doctor && <p className="text-xs text-red-500 mt-1">{formErrors.doctor}</p>}

              {selectedDoctor && (
                <div className="p-4 border rounded-md">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{selectedDoctor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedDoctor.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedDoctor.designation}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
