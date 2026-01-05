"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Clock, Search } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, FormEvent } from "react";
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface PatientOption {
    patient_id: number;
    name: string;
    age: number;
    phone_number?: string;
    email?: string;
}
interface DoctorOption {
    doctor_id: number;
    name: string;
    specialty: string;
    availability?: string[];
}
interface TimeSlotOption {
    slot_id: number;
    start_time: string; 
}

// Sample doctors data
//const doctors = [
//  {
//    id: "1",
//    name: "Dr. Sarah Johnson",
//    image: "/colorful-abstract-shapes.png",
//    specialty: "Cardiology",
//    availability: ["Monday", "Wednesday", "Friday"],
//  },
//  {
//    id: "2",
//    name: "Dr. Michael Chen",
//    image: "/colorful-abstract-shapes.png",
//    specialty: "Neurology",
//    availability: ["Tuesday", "Thursday"],
//  },
//  {
//    id: "3",
//    name: "Dr. Lisa Patel",
//    image: "/user-3.png",
//    specialty: "Pediatrics",
//    availability: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
//  },
//  {
//    id: "4",
//    name: "Dr. James Wilson",
//    image: "/user-3.png",
//    specialty: "Orthopedics",
//    availability: ["Monday", "Wednesday", "Friday"],
//  },
//  {
//    id: "5",
//    name: "Dr. Emily Rodriguez",
//    image: "/user-3.png",
//    specialty: "Dermatology",
//    availability: ["Tuesday", "Thursday"],
//  },
//];

// Sample patients data
//const patients = [
//  {
//    id: "1",
//    name: "John Smith",
//    image: "/colorful-abstract-shapes.png",
//    dob: "1978-05-15",
//    phone: "+1 (555) 123-4567",
//    email: "john.smith@example.com",
//  },
//  {
//    id: "2",
//    name: "Emily Davis",
//    image: "/colorful-abstract-shapes.png",
//    dob: "1990-08-22",
//    phone: "+1 (555) 234-5678",
//    email: "emily.davis@example.com",
//  },
//  {
//    id: "3",
//    name: "Robert Wilson",
//    image: "/user-3.png",
//    dob: "1965-03-10",
//    phone: "+1 (555) 345-6789",
//    email: "robert.wilson@example.com",
//  },
//  {
//    id: "4",
//    name: "Jessica Brown",
//    image: "/user-3.png",
//    dob: "1995-11-28",
//    phone: "+1 (555) 456-7890",
//    email: "jessica.brown@example.com",
//  },
//  {
//    id: "5",
//    name: "Michael Johnson",
//    image: "/user-3.png",
//    dob: "1982-07-03",
//    phone: "+1 (555) 567-8901",
//    email: "michael.johnson@example.com",
//  },
//];

// Sample appointment types
const appointmentTypes = [
  { id: "1", name: "Check-up", duration: 30, color: "blue" },
  { id: "2", name: "Consultation", duration: 45, color: "green" },
  { id: "3", name: "Follow-up", duration: 20, color: "purple" },
  { id: "4", name: "Procedure", duration: 60, color: "orange" },
  { id: "5", name: "Emergency", duration: 60, color: "red" },
  { id: "6", name: "Vaccination", duration: 15, color: "teal" },
  { id: "7", name: "Lab Work", duration: 30, color: "indigo" },
  { id: "8", name: "Physical Therapy", duration: 45, color: "amber" },
];

// Sample time slots
//const timeSlots = ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM"];

export default function AddAppointmentPage() {
  const { token, user } = useAuth();
  const router = useRouter();

  // --- State for Dropdowns and Search ---
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [patientSearchResults, setPatientSearchResults] = useState<PatientOption[]>([]);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlotOption[]>([]);
  const [isSearchingPatients, setIsSearchingPatients] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // --- State for the Form Fields ---
  const [selectedPatient, setSelectedPatient] = useState<PatientOption | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorOption | null>(null);
  const [appointmentType, setAppointmentType] = useState("");
  const [appointmentDate, setAppointmentDate] = useState<Date | undefined>();

  //const [appointmentTime, setAppointmentTime] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [duration, setDuration] = useState("30");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState("Booked");
  const [notes, setNotes] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<any>({});

    // --- Fetch initial data for the Doctors dropdown ---
    useEffect(() => {
        if (!token) return;
        const fetchDoctors = async () => {
            try {
                const res = await fetch('http://localhost:5150/api/form-data/doctors', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) setDoctors(await res.json());
            } catch (error) {
                console.error("Failed to fetch doctors:", error);
            }
        };
        fetchDoctors();
    }, [token]);

    // --- Fetch patient search results as the user types ---
    useEffect(() => {
        if (patientSearchTerm.length < 2 || !token) {
            setPatientSearchResults([]);
            return;
        }
        const fetchResults = async () => {
            setIsSearchingPatients(true);
            try {
                const res = await fetch(`http://localhost:5150/api/form-data/patients/search?query=${patientSearchTerm}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) setPatientSearchResults(await res.json());
            } catch (error) {
                console.error("Failed to search patients:", error);
            } finally {
                setIsSearchingPatients(false);
            }
        };
        const timerId = setTimeout(fetchResults, 300); // Debounce to avoid too many API calls
        return () => clearTimeout(timerId);
    }, [patientSearchTerm, token]);

    // --- Fetch available time slots when a doctor or date is selected ---
    useEffect(() => {
        if (!selectedDoctor || !appointmentDate || !token) {
            setAvailableSlots([]);
            return;
        }
        const fetchSlots = async () => {
            setIsLoadingSlots(true);
            const dateString = appointmentDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
            try {
                const res = await fetch(`http://localhost:5150/api/form-data/slots?doctorId=${selectedDoctor.doctor_id}&date=${dateString}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) setAvailableSlots(await res.json());
            } catch (error) {
                console.error("Failed to fetch slots", error);
            } finally {
                setIsLoadingSlots(false);
            }
        };
        fetchSlots();
    }, [selectedDoctor, appointmentDate, token]);


    const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Basic validation
    const errors: any = {};
    if (!selectedPatient) errors.patient = "Please select a patient";
    if (!selectedDoctor) errors.doctor = "Please select a doctor";
    if (!appointmentType) errors.type = "Please select an appointment type";
    if (!appointmentDate) errors.date = "Please select a date";
    //if (!appointmentTime) errors.time = "Please select a time";
    if (!selectedSlotId) errors.time = "Please select a time";
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    const appointmentData = {
        patient_id: selectedPatient?.patient_id,
        doctor_id: selectedDoctor?.doctor_id,
        slot_id: parseInt(selectedSlotId),
        appointment_date: appointmentDate,
        status: status,
        reason: reason,
        client_id: user?.client_id, 
    };

    try {
        const response = await fetch('http://localhost:5150/api/appointments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(appointmentData)
        });
        if (!response.ok) throw new Error('Failed to schedule.');
        router.push('/appointments');
    } catch (err) {
        if (err instanceof Error) {
            setFormErrors({ submit: err.message });
        } else {
            setFormErrors({ submit: 'An unknown error occurred.' });
        }
    }
};
//    // Submit form logic would go here
//    alert("Appointment scheduled successfully!");
//  };

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

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Appointment Details</CardTitle>
              <CardDescription>Enter the details for the new appointment.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="appointment-type">Appointment Type</Label>
                  <Select value={appointmentType} onValueChange={setAppointmentType}>
                    <SelectTrigger id="appointment-type" className={formErrors.type ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select appointment type" />
                    </SelectTrigger>
                    <SelectContent>
                      {appointmentTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          <div className="flex items-center">
                            <div className="h-2 w-2 rounded-full mr-2" style={{ backgroundColor: `var(--${type.color}-500, #3b82f6)` }} />
                            {type.name} ({type.duration} min)
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.type && <p className="text-xs text-red-500 mt-1">{formErrors.type}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={`w-full justify-start text-left font-normal ${formErrors.date ? "border-red-500" : ""}`}>
                      <span>{appointmentDate ? appointmentDate.toDateString() : "Pick a date"}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={appointmentDate} onSelect={setAppointmentDate} />
                    </PopoverContent>
                  </Popover>
                  {formErrors.date && <p className="text-xs text-red-500 mt-1">{formErrors.date}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                    <Select value={selectedSlotId} onValueChange={setSelectedSlotId} disabled={isLoadingSlots || availableSlots.length === 0} >
                    <SelectTrigger id="time" className={formErrors.time ? "border-red-500" : ""}>
                    <SelectValue placeholder={isLoadingSlots ? "Loading slots..." : "Select time slot"} />
                    </SelectTrigger>
                    <SelectContent>
                    {availableSlots.map((slot) => (
                          <SelectItem key={slot.slot_id} value={slot.slot_id.toString()}>
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4" />
                            {new Date(`1970-01-01T${slot.start_time}Z`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'UTC' })}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.time && <p className="text-xs text-red-500 mt-1">{formErrors.time}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger id="duration">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="20">20 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                      <SelectItem value="90">90 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Visit</Label>
                  <Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Enter the reason for the appointment" className="min-h-[100px]" />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Appointment Status</h3>
                <RadioGroup value={status} onValueChange={setStatus} className="flex flex-col space-y-1">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="scheduled" id="scheduled" />
                    <Label htmlFor="scheduled">Scheduled</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="tentative" id="tentative" />
                    <Label htmlFor="tentative">Tentative (Pending Confirmation)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="waitlist" id="waitlist" />
                    <Label htmlFor="waitlist">Add to Waitlist</Label>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Additional Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes for Staff</Label>
                  <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Enter any additional notes for staff" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()} asChild>
            <Link href="/appointments">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Scheduling...' : 'Schedule Appointment'}</Button>
          </div>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Select Patient</CardTitle>
              <CardDescription>Search and select a patient for this appointment.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={`w-full justify-between ${formErrors.patient ? "border-red-500" : ""}`}>
                    <span>{selectedPatient ? selectedPatient.name : "Search patients..."}</span>
                    <Search className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                <CommandInput
                    placeholder="Search by name..."
                    value={patientSearchTerm}
                    onValueChange={setPatientSearchTerm}
                />
                <CommandList>
                    {isSearchingPatients && <CommandEmpty>Searching...</CommandEmpty>}
                    {!isSearchingPatients && patientSearchResults.length === 0 && patientSearchTerm.length > 1 && <CommandEmpty>No patients found.</CommandEmpty>}
                <CommandGroup>
                {patientSearchResults.map((patient) => (
                    <CommandItem
                        key={patient.patient_id}
                        value={patient.name}
                        onSelect={() => {
                            setSelectedPatient(patient);
                            setPatientSearchTerm(patient.name); 
                            setPatientSearchResults([]); 
                        }}
                    >
                <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                    {/*<AvatarImage src={patient.image || "/user-2.png?height=40&width=40&query=patient"} alt={patient.name} />*/}
                    <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                <p className="text-sm font-medium">{patient.name}</p>
                <p className="text-xs text-muted-foreground">Age: {patient.age}</p>
                </div>
                </div>
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
                      {/*<AvatarImage src={selectedPatient.image || "/user-2.png"} alt={selectedPatient.name} />*/}
                      <AvatarFallback>{selectedPatient.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedPatient.name}</p>
                      <p className="text-sm text-muted-foreground">Age : {selectedPatient.age}</p>
                    </div>
                  </div>
                  <div className="mt-3 text-sm space-y-1">
                    <p>Phone: {selectedPatient.phone_number}</p>
                    <p>Email: {selectedPatient.email}</p>
                  </div>
                  <Button variant="link" className="p-0 h-auto mt-2 text-sm">
                    View patient details
                  </Button>
                </div>
              )}

              <Button variant="outline" className="w-full" asChild>
                <Link href="/patients/add">Register New Patient</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Select Doctor</CardTitle>
              <CardDescription>Choose a doctor for this appointment.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                /*value={selectedDoctor ? selectedDoctor.id : ""}*/
                onValueChange={(value) => {
                const doctor = doctors.find((d) => d.doctor_id.toString() === value);
                setSelectedDoctor(doctor || null);  
                }}
              >
                <SelectTrigger className={formErrors.doctor ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select a doctor" />
                </SelectTrigger>
                <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.doctor_id} value={doctor.doctor_id.toString()}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          {/*<AvatarImage src={doctor.image || "/user-2.png?height=40&width=40&query=doctor"} alt={doctor.name} />*/}
                          <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{doctor.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.doctor && <p className="text-xs text-red-500 mt-1">{formErrors.doctor}</p>}

              {selectedDoctor && (
                <div className="p-4 border rounded-md">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      {/*<AvatarImage src={selectedDoctor.image || "/user-2.png"} alt={selectedDoctor.name} />*/}
                      <AvatarFallback>{selectedDoctor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedDoctor.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedDoctor.specialty}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm font-medium">Availability:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedDoctor.availability?.map((day: any) => (
                        <span key={day} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {day}
                        </span>
                      ))}
                    </div>
                  </div>
                 <Button variant="link" className="p-0 h-auto mt-2 text-sm" asChild>
                 <Link href={`/doctors/${selectedDoctor.doctor_id}/schedule`}>View doctor schedule</Link>
                 </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
