"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, FormEvent, use } from "react";

// Type definitions
interface Doctor {
  id: string;
  name: string;
  designation: string;
}

interface PatientFormData {
  firstName: string;
  lastName: string;
  age: string;
  gender: string;
  phoneNumber: string;
  doctorId: string;
  email: string;
  bloodType: string;
  heightCm: string;
  weightKg: string;
}

interface Patient {
  id: string;
  publicId: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  phoneNumber: string;
  doctor: {
    id: string;
    name: string;
  };
  email?: string;
  bloodType?: string;
  heightCm?: number;
  weightKg?: number;
}

const initialFormData: PatientFormData = {
  firstName: '',
  lastName: '',
  age: '',
  gender: '',
  phoneNumber: '',
  doctorId: '',
  email: '',
  bloodType: '',
  heightCm: '',
  weightKg: '',
};

export default function PatientEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: patientId } = use(params);
  const router = useRouter();

  const [formData, setFormData] = useState<PatientFormData>(initialFormData);
  const [originalData, setOriginalData] = useState<PatientFormData>(initialFormData);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDoctorsLoading, setIsDoctorsLoading] = useState(true);
  const [error, setError] = useState('');

  // Check if form has changes (dirty state)
  const isDirty = JSON.stringify(formData) !== JSON.stringify(originalData);

  // Fetch patient data
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await fetch(`/api/patients/${patientId}`);
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const patient: Patient = result.data;
            const patientFormData: PatientFormData = {
              firstName: patient.firstName || '',
              lastName: patient.lastName || '',
              age: patient.age?.toString() || '',
              gender: patient.gender || '',
              phoneNumber: patient.phoneNumber || '',
              doctorId: patient.doctor?.id || '',
              email: patient.email || '',
              bloodType: patient.bloodType || '',
              heightCm: patient.heightCm?.toString() || '',
              weightKg: patient.weightKg?.toString() || '',
            };
            setFormData(patientFormData);
            setOriginalData(patientFormData);
          }
        } else {
          setError('Failed to load patient data.');
        }
      } catch (err) {
        console.error('Failed to fetch patient:', err);
        setError('Failed to load patient data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatient();
  }, [patientId]);

  // Fetch doctors list
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch('/api/doctors');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setDoctors(result.data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch doctors:', err);
      } finally {
        setIsDoctorsLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (name: keyof PatientFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = (): string | null => {
    const trimmedFirstName = formData.firstName.trim();
    const trimmedLastName = formData.lastName.trim();
    const trimmedPhone = formData.phoneNumber.trim();
    const age = parseInt(formData.age || '0', 10);

    if (!trimmedFirstName) {
      return 'First name is required.';
    }
    if (trimmedFirstName.length < 2) {
      return 'First name must be at least 2 characters.';
    }

    if (!trimmedLastName) {
      return 'Last name is required.';
    }
    if (trimmedLastName.length < 2) {
      return 'Last name must be at least 2 characters.';
    }

    if (!formData.age) {
      return 'Age is required.';
    }
    if (isNaN(age) || age < 0 || age > 150) {
      return 'Please enter a valid age (0-150).';
    }

    if (!formData.gender) {
      return 'Gender is required.';
    }

    if (!trimmedPhone) {
      return 'Phone number is required.';
    }
    if (trimmedPhone.length < 10) {
      return 'Please enter a valid phone number (at least 10 digits).';
    }

    if (!formData.doctorId) {
      return 'Please select a doctor.';
    }

    // Validate email format if provided
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        return 'Please enter a valid email address.';
      }
    }

    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);

    try {
      // Build payload matching backend expectations
      const payload: Record<string, unknown> = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        age: parseInt(formData.age, 10),
        gender: formData.gender.toUpperCase(),
        phoneNumber: formData.phoneNumber.trim(),
        doctorId: formData.doctorId,
      };

      // Optional fields - only include if they have values
      if (formData.email.trim()) {
        payload.email = formData.email.trim();
      }
      if (formData.bloodType) {
        payload.bloodType = formData.bloodType;
      }
      if (formData.heightCm) {
        payload.heightCm = parseFloat(formData.heightCm);
      }
      if (formData.weightKg) {
        payload.weightKg = parseFloat(formData.weightKg);
      }

      const response = await fetch(`/api/patients/${patientId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('You are not authorized to perform this action.');
        }
        const result = await response.json();
        const errorMessages = result.errors
          ? Object.values(result.errors).flat().join(' ')
          : result.message || 'Failed to update patient.';
        throw new Error(errorMessages);
      }

      router.push(`/patients/${patientId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4 flex-wrap">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/patients/${patientId}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mb-2">Edit Patient</h1>
          <p className="text-muted-foreground">Update patient information.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
            <CardDescription>Update the patient's personal and medical details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter last name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age <span className="text-red-500">*</span></Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="Enter age"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender <span className="text-red-500">*</span></Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleSelectChange('gender', value)}
                  >
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Contact Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number <span className="text-red-500">*</span></Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Assigned Doctor Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Assigned Doctor</h3>
              <div className="space-y-2">
                <Label htmlFor="doctorId">Select Doctor <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.doctorId}
                  onValueChange={(value) => handleSelectChange('doctorId', value)}
                  disabled={isDoctorsLoading}
                >
                  <SelectTrigger id="doctorId">
                    <SelectValue placeholder={isDoctorsLoading ? "Loading doctors..." : "Select a doctor"} />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.name} - {doctor.designation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Medical Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Medical Information (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bloodType">Blood Type</Label>
                  <Select
                    value={formData.bloodType}
                    onValueChange={(value) => handleSelectChange('bloodType', value)}
                  >
                    <SelectTrigger id="bloodType">
                      <SelectValue placeholder="Select blood type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heightCm">Height (cm)</Label>
                  <Input
                    id="heightCm"
                    name="heightCm"
                    type="number"
                    value={formData.heightCm}
                    onChange={handleChange}
                    placeholder="Enter height"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weightKg">Weight (kg)</Label>
                  <Input
                    id="weightKg"
                    name="weightKg"
                    type="number"
                    value={formData.weightKg}
                    onChange={handleChange}
                    placeholder="Enter weight"
                  />
                </div>
              </div>
            </div>

            {error && <p className="text-red-500 text-center py-4">{error}</p>}

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" asChild>
                <Link href={`/patients/${patientId}`}>Cancel</Link>
              </Button>
              <Button type="submit" disabled={!isDirty || isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
