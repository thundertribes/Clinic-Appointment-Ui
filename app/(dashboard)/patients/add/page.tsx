"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, FormEvent } from "react";
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// Interface for doctor data from API
interface Doctor {
    id: string;
    name: string;
    number: string;
    designation: string;
}

// This interface defines the shape of our form data
interface PatientFormData {
    firstName?: string;
    middleName?: string;
    lastName?: string;
    age?: string;
    gender?: string;
    addressLine?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    email?: string;
    phoneNumber?: string;
    bloodType?: string;
    heightCm?: string;
    weightKg?: string;
    familyMedicalHistory?: string;
    doctorId?: string;
}

export default function AddPatientPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<PatientFormData>({
    familyMedicalHistory: '',
  });
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDoctorsLoading, setIsDoctorsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch doctors list on component mount
  useEffect(() => {
    const fetchDoctors = async () => {
      setIsDoctorsLoading(true);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleValueChange = (name: keyof PatientFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (field: keyof PatientFormData, value: string, isChecked: boolean) => {
    setFormData(prev => {
      const currentValues = (prev[field] as string || '').split(',').filter(Boolean);
      if (isChecked && !currentValues.includes(value)) {
        currentValues.push(value);
      } else if (!isChecked) {
        const index = currentValues.indexOf(value);
        if (index > -1) currentValues.splice(index, 1);
      }
      return { ...prev, [field]: currentValues.join(',') };
    });
  };

  const validateForm = (): string | null => {
    const trimmedFirstName = formData.firstName?.trim();
    const trimmedLastName = formData.lastName?.trim();
    const trimmedPhone = formData.phoneNumber?.trim();
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
      return 'Please enter a valid phone number.';
    }

    if (!formData.doctorId) {
      return 'Please select a doctor.';
    }

    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('You must be logged in to add a patient.');
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      // Build payload matching backend expectations
      const payload: Record<string, unknown> = {
        // Required fields
        firstName: formData.firstName?.trim(),
        lastName: formData.lastName?.trim(),
        age: parseInt(formData.age as string, 10),
        gender: formData.gender?.toUpperCase(),
        phoneNumber: formData.phoneNumber?.trim(),
        doctorId: formData.doctorId,
      };

      // Optional fields - only include if they have values
      if (formData.email?.trim()) {
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

      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('You are not authorized to perform this action.');
        }
        const result = await response.json();
        const errorMessages = result.errors ? Object.values(result.errors).flat().join(' ') : (result.message || 'Failed to register.');
        throw new Error(errorMessages);
      }
      router.push('/patients');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center flex-wrap gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/patients">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mb-2">Add Patient</h1>
          <p className="text-muted-foreground">Register a new patient in your clinic.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Patient Registration</CardTitle>
            <CardDescription>Enter the patient's personal and medical details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Personal Information</h3>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                  <Input id="firstName" name="firstName" value={formData.firstName || ''} onChange={handleChange} placeholder="Enter first name" required />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="middleName">Middle Name (Optional)</Label>
                  <Input id="middleName" name="middleName" value={formData.middleName || ''} onChange={handleChange} placeholder="Enter middle name" />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                  <Input id="lastName" name="lastName" value={formData.lastName || ''} onChange={handleChange} placeholder="Enter last name" required />
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="age">Age <span className="text-red-500">*</span></Label>
                  <Input id="age" name="age" value={formData.age || ''} onChange={handleChange} type="number" placeholder="Enter age" required />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="gender">Gender <span className="text-red-500">*</span></Label>
                  <Select name="gender" onValueChange={(value) => handleValueChange('gender', value)} required>
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressLine">Address (Optional)</Label>
                <Textarea id="addressLine" name="addressLine" value={formData.addressLine || ''} onChange={handleChange} placeholder="Enter address"/>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="city">City (Optional)</Label>
                  <Input id="city" name="city" value={formData.city || ''} onChange={handleChange} placeholder="Enter city" />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="state">State (Optional)</Label>
                  <Input id="state" name="state" value={formData.state || ''} onChange={handleChange} placeholder="Enter state" />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="zipCode">Zip Code (Optional)</Label>
                  <Input id="zipCode" name="zipCode" value={formData.zipCode || ''} onChange={handleChange} placeholder="Enter zip code" />
                </div>
              </div>
            </div>

            <Separator />

            {/* Contact Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Information</h3>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input id="email" name="email" type="email" value={formData.email || ''} onChange={handleChange} placeholder="Enter email address" />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number <span className="text-red-500">*</span></Label>
                  <Input id="phoneNumber" name="phoneNumber" value={formData.phoneNumber || ''} onChange={handleChange} placeholder="Enter phone number" required />
                </div>
              </div>
            </div>

            <Separator />

            {/* Assigned Doctor Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Assigned Doctor</h3>
              <div className="flex-1 space-y-2">
                <Label htmlFor="doctorId">Select Doctor <span className="text-red-500">*</span></Label>
                <Select name="doctorId" onValueChange={(value) => handleValueChange('doctorId', value)} required disabled={isDoctorsLoading}>
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
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="bloodType">Blood Type</Label>
                  <Select name="bloodType" onValueChange={(value) => handleValueChange('bloodType', value)}>
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
                <div className="flex-1 space-y-2">
                  <Label htmlFor="heightCm">Height (cm)</Label>
                  <Input id="heightCm" name="heightCm" value={formData.heightCm || ''} onChange={handleChange} type="number" placeholder="Enter height" />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="weightKg">Weight (kg)</Label>
                  <Input id="weightKg" name="weightKg" value={formData.weightKg || ''} onChange={handleChange} type="number" placeholder="Enter weight" />
                </div>
              </div>
            </div>

            <Separator />

            {/* Family Medical History Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Family Medical History (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="diabetes" onCheckedChange={(checked) => handleCheckboxChange('familyMedicalHistory', 'Diabetes', !!checked)} />
                  <Label htmlFor="diabetes">Diabetes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="heart-disease" onCheckedChange={(checked) => handleCheckboxChange('familyMedicalHistory', 'Heart Disease', !!checked)} />
                  <Label htmlFor="heart-disease">Heart Disease</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="hypertension" onCheckedChange={(checked) => handleCheckboxChange('familyMedicalHistory', 'Hypertension', !!checked)} />
                  <Label htmlFor="hypertension">Hypertension</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="cancer" onCheckedChange={(checked) => handleCheckboxChange('familyMedicalHistory', 'Cancer', !!checked)} />
                  <Label htmlFor="cancer">Cancer</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="asthma" onCheckedChange={(checked) => handleCheckboxChange('familyMedicalHistory', 'Asthma', !!checked)} />
                  <Label htmlFor="asthma">Asthma</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="mental-health" onCheckedChange={(checked) => handleCheckboxChange('familyMedicalHistory', 'Mental Health', !!checked)} />
                  <Label htmlFor="mental-health">Mental Health Conditions</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="familyMedicalHistory">Additional Notes</Label>
                <Textarea id="familyMedicalHistory" name="familyMedicalHistory" value={formData.familyMedicalHistory || ''} onChange={handleChange} placeholder="Enter any additional family medical history" />
              </div>
            </div>

            {error && <p className="text-red-500 text-center py-4">{error}</p>}

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>{isLoading ? 'Registering...' : 'Register Patient'}</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
