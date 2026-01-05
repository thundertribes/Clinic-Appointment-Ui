"use client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";
import { useState, FormEvent } from "react";
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// This interface defines the shape of our form data
interface PatientFormData {
    firstName?: string;
    middleName?: string;
    lastName?: string;
    age?: string;
    gender?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    email?: string;
    phoneNumber?: string;
    alternativePhone?: string;
    preferredContactMethod?: string;
    bloodType?: string;
    heightCm?: string;
    weightKg?: string;
    allergies?: string;
    chronicConditions?: string;
    currentMedications?: string;
    pastSurgeries?: string;
    previousHospitalizations?: string;
    familyMedicalHistory?: string;
    lifestyleInfo?: string;
}

export default function AddPatientPage() {
  const { token } = useAuth();
  const router = useRouter();
    const [formData, setFormData] = useState<PatientFormData>({
        preferredContactMethod: 'Phone',
        familyMedicalHistory: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  //const [appointmentDate, setAppointmentDate] = useState<Date | undefined>(new Date());
  //const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleValueChange = (name: keyof PatientFormData, value: any) => {
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
  const handleDateChange = (date: Date | undefined) => {
      setFormData(prev => ({ ...prev, dateOfBirth: date }));
  };

    //SUBMISSION HANDLER: logic for the save button 
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!token) { return; }
        try {
            const payload = {
                firstName: formData.firstName || null,
                lastName: formData.lastName || null,
                age: parseInt(formData.age as string || '0', 10),
                gender: formData.gender || null,
                address: formData.address || null,
                phoneNumber: formData.phoneNumber || null,
                preferredContactMethod: formData.preferredContactMethod || null,
                bloodType: formData.bloodType || null,
                heightCm: parseFloat(formData.heightCm as string || '0'),
                weightKg: parseFloat(formData.weightKg as string || '0'),
                allergies: formData.allergies || null,

                // Optional Fields - we ensure they exist in the payload, even if as null
                middleName: formData.middleName || null,
                city: formData.city || null,
                state: formData.state || null,
                zipCode: formData.zipCode || null,
                email: formData.email || null,
                alternativePhone: formData.alternativePhone || null,
                currentMedications: formData.currentMedications || null,
                previousHospitalizations: formData.previousHospitalizations || null,
                familyMedicalHistory: formData.familyMedicalHistory || null,
                lifestyleInfo: formData.lifestyleInfo || null,
                // Add your new optional fields here in the same pattern
                chronicConditions: formData.chronicConditions || null,
                pastSurgeries: formData.pastSurgeries || null,
            };

            const response = await fetch('http://localhost:5150/api/patients', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
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
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="personal">Personal Information</TabsTrigger>
          <TabsTrigger value="medical">Medical Information</TabsTrigger>
          {/*<TabsTrigger value="insurance">Insurance & Billing</TabsTrigger>*/}
          {/*  <TabsTrigger value="consent">Consent & Documents</TabsTrigger>*/}
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Enter the patient's personal details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                    <Input id="firstName" name="firstName" value={formData.firstName || ''} onChange={handleChange}  placeholder="Enter first name" required />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="middleName">Middle Name (Optional)</Label>
                    <Input id="middleName" name="middleName" value={formData.middleName || ''} onChange={handleChange} placeholder="Enter Middle Name" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                    <Input id="lastName" name="lastName" value={formData.lastName || ''} onChange={handleChange} placeholder="Enter last name" required />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="age">Age <span className="text-red-500">*</span></Label>
                      {/*<Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>*/}
                    {/*  <PopoverTrigger asChild>*/}
                    {/*    <Button variant="outline" className={`w-full justify-start text-left font-normal `}>*/}
                    {/*    <span>{formData.dateOfBirth ? formData.dateOfBirth.toDateString() : "Pick a date"}</span>*/}
                    {/*    </Button>*/}
                    {/*  </PopoverTrigger>*/}
                    {/*  <PopoverContent className="w-auto p-0" align="start">*/}
                    {/*  <Calendar mode="single" selected={formData.dateOfBirth} onSelect={(date) => {handleDateChange(date);setIsCalendarOpen(false);*/}
                    {/*  }} disabled={(date) => date > new Date()}}/>*/}
                    {/*  </PopoverContent>*/}
                                          {/*</Popover>*/}
                  <Input id="age" name="age" value={formData.age || ''} onChange={handleChange}  type="number" placeholder="Enter age" required />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="gender">Gender <span className="text-red-500">*</span></Label>
                      <Select name="gender" onValueChange={(value) => handleValueChange('gender', value)} required >
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 space-y-2">
                    {/*<Label htmlFor="marital-status">Marital Status</Label>*/}
                    {/*<Select>*/}
                    {/*  <SelectTrigger id="marital-status">*/}
                      {/*  <SelectValue placeholder="Select status" />*/}
                    {/*  </SelectTrigger>*/}
                    {/*  <SelectContent>*/}
                    {/*    <SelectItem value="single">Single</SelectItem>*/}
                    {/*    <SelectItem value="married">Married</SelectItem>*/}
                    {/*    <SelectItem value="divorced">Divorced</SelectItem>*/}
                    {/*    <SelectItem value="widowed">Widowed</SelectItem>*/}
                    {/*    <SelectItem value="separated">Separated</SelectItem>*/}
                    {/*  </SelectContent>*/}
                    {/*</Select>*/}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address (Optional)</Label>
                  <Textarea id="address" name="address" value={formData.address || ''} onChange={handleChange} placeholder="Enter address"/>
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
                    <Label htmlFor="zip">Zip Code (Optional)</Label>
                    <Input id="zipCode  " name="zipCode" value={formData.zipCode || ''} onChange={handleChange} placeholder="Enter zip code" />
                  </div>
                </div>
              </div>

              <Separator />

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
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="alternativePhone">Alternative Phone (Optional)</Label>
                    <Input id="alternativePhone" name="alternativePhone" value={formData.alternativePhone || ''} onChange={handleChange} placeholder="Enter alternative phone" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferredContactMethod">Preferred Contact Method <span className="text-red-500">*</span></Label>
                    <RadioGroup defaultValue="Phone" name="preferredContactMethod" onValueChange={(value) => handleValueChange('preferredContactMethod', value)} className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Phone" id="phone-contact" />
                      <Label htmlFor="phone-contact">Phone</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Email" id="email-contact" />
                      <Label htmlFor="email-contact">Email</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="SMS" id="sms-contact" />
                      <Label htmlFor="sms-contact">SMS</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>


              {/*<Separator />*/}

              {/*<div className="space-y-4">*/}
              {/*  <h3 className="text-lg font-medium">Emergency Contact</h3>*/}
              {/*  <div className="flex flex-col md:flex-row gap-4">*/}
              {/*    <div className="flex-1 space-y-2">*/}
              {/*      <Label htmlFor="emergency-name">Contact Name</Label>*/}
              {/*      <Input id="emergency-name" placeholder="Enter emergency contact name" />*/}
              {/*    </div>*/}
              {/*    <div className="flex-1 space-y-2">*/}
              {/*      <Label htmlFor="emergency-relation">Relationship</Label>*/}
              {/*      <Input id="emergency-relation" placeholder="Enter relationship" />*/}
              {/*    </div>*/}
              {/*  </div>*/}
              {/*  <div className="flex flex-col md:flex-row gap-4">*/}
              {/*    <div className="flex-1 space-y-2">*/}
              {/*      <Label htmlFor="emergency-phone">Phone Number</Label>*/}
              {/*      <Input id="emergency-phone" placeholder="Enter emergency contact phone" />*/}
              {/*    </div>*/}
              {/*    <div className="flex-1 space-y-2">*/}
              {/*      <Label htmlFor="emergency-email">Email (Optional)</Label>*/}
              {/*      <Input id="emergency-email" type="email" placeholder="Enter emergency contact email" />*/}
              {/*    </div>*/}
              {/*  </div>*/}
              {/*</div>*/}

              {/*<Separator />*/}

              {/*<div className="space-y-4">*/}
              {/*  <h3 className="text-lg font-medium">Profile Photo</h3>*/}
              {/*  <div className="flex items-center gap-4">*/}
              {/*    <div className="h-24 w-24 shrink-0 rounded-full bg-muted flex items-center justify-center">*/}
              {/*      <Upload className="h-8 w-8 text-muted-foreground" />*/}
              {/*    </div>*/}
              {/*    <div className="space-y-2">*/}
              {/*      <input type="file" id="profile-photo" className="hidden" />*/}
              {/*      <Button variant="outline" onClick={() => document.getElementById("profile-photo")?.click()}>Upload Photo</Button>*/}
              {/*      <p className="text-sm text-muted-foreground">Upload a profile photo. JPG, PNG or GIF. Max 2MB.</p>*/}
              {/*    </div>*/}
              {/*  </div>*/}
              {/*</div>*/}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Medical Information</CardTitle>
              <CardDescription>Enter the patient's medical history and details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="bloodType">Blood Type <span className="text-red-500">*</span></Label>
                      <Select name="bloodType" onValueChange={(value) => handleValueChange('bloodType', value)} required>
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
                        <SelectItem value="O=">O-</SelectItem>
                        <SelectItem value="unknown">Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="heightCm">Height (cm) <span className="text-red-500">*</span></Label>
                    <Input id="heightCm" name="heightCm" value={formData.heightCm || ''} onChange={handleChange} type="number" placeholder="Enter height" required />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="weightKg">Weight (kg) <span className="text-red-500">*</span></Label>
                    <Input id="weightKg" name="weightKg" value={formData.weightKg || ''} onChange={handleChange} type="number" placeholder="Enter weight" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allergies">Allergies (Optinoal)</Label>
                  <Textarea id="allergies" name="allergies" value={formData.allergies || ''} onChange={handleChange} placeholder="List any allergies (medications, food, etc.)" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentMedications">Current Medications (Optional)</Label>
                  <Textarea id="currentMedications" name="currentMedications" value={formData.currentMedications || ''} onChange={handleChange}  placeholder="List any current medications" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chronicConditions">Chronic Conditions (Optional)</Label>
                  <Textarea id="chronicConditions" name="chronicConditions" value={formData.chronicConditions || ''} onChange={handleChange} placeholder="List any chronic conditions" />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Medical History</h3>
                <div className="space-y-2">
                  <Label htmlFor="pastSurgeries">Past Surgeries (Optional)</Label>
                  <Textarea id="pastSurgeries" name="pastSurgeries" value={formData.pastSurgeries || ''} onChange={handleChange} placeholder="List any past surgeries with dates" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="previousHospitalizations">Previous Hospitalizations (Optional)</Label>
                  <Textarea id="previousHospitalizations" name="previousHospitalizations" value={formData.previousHospitalizations || ''} onChange={handleChange}  placeholder="List any previous hospitalizations with dates" />
                </div>

                <div className="space-y-2">
                  <Label>Family Medical History (Optional)</Label>
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
                      <Checkbox id="asthma" onCheckedChange={(checked) => handleCheckboxChange('familyMedicalHistory', 'asthma', !!checked)} />
                      <Label htmlFor="asthma">Asthma</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="mental-health" onCheckedChange={(checked) => handleCheckboxChange('familyMedicalHistory', 'Mental-health', !!checked)} />
                      <Label htmlFor="mental-health">Mental Health Conditions</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                <Label htmlFor="familyMedicalHistory">Additional Family History Notes (Optional)</Label>
                <Textarea id="familyMedicalHistory" name="familyMedicalHistory" value={formData.familyMedicalHistory || ''} onChange={handleChange}  placeholder="Enter any additional family medical history" />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Lifestyle Information (Optional)</h3>
                <div className="space-y-2">
                    <Label htmlFor="smokingStatus">Smoking Status</Label>
                    <Select name="lifestyleInfo" onValueChange={(value) => handleValueChange('lifestyleInfo', `Smoking: ${value}`)}>
                      <SelectTrigger id="smokingStatus">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Never">Never Smoked</SelectItem>
                      <SelectItem value="Former">Former Smoker</SelectItem>
                      <SelectItem value="Current">Current Smoker</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alcohol">Alcohol Consumption (Optional)</Label>
                    <Select name="lifestyleInfo" onValueChange={(value) => handleValueChange('lifestyleInfo', `${ formData.lifestyleInfo }Alcohol: ${value}`)}>
                    <SelectTrigger id="alcohol">
                      <SelectValue placeholder="Select consumption" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="None">None</SelectItem>
                      <SelectItem value="Occasional">Occasional</SelectItem>
                      <SelectItem value="Moderate">Moderate</SelectItem>
                      <SelectItem value="Heavy">Heavy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exercise">Exercise Frequency (Optional)</Label>
                    <Select name="lifestyleInfo" onValueChange={(value) => handleValueChange('lifestyleInfo', `${formData.lifestyleInfo}, Exercise: ${value}`)}>
                    <SelectTrigger id="exercise">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="occasional">Occasional</SelectItem>
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="diet">Dietary Habits (Optional)</Label>
                  <Textarea id="lifestyleInfo" name="lifestyleInfo" placeholder="Describe dietary habits" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insurance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Insurance & Billing Information</CardTitle>
              <CardDescription>Enter the patient's insurance and payment details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Primary Insurance</h3>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="insurance-provider">Insurance Provider</Label>
                    <Input id="insurance-provider" placeholder="Enter insurance provider" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="policy-number">Policy Number</Label>
                    <Input id="policy-number" placeholder="Enter policy number" />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="group-number">Group Number</Label>
                    <Input id="group-number" placeholder="Enter group number" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="policy-holder">Policy Holder Name</Label>
                    <Input id="policy-holder" placeholder="Enter policy holder name" />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="relationship">Relationship to Patient</Label>
                    <Select>
                      <SelectTrigger id="relationship">
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="self">Self</SelectItem>
                        <SelectItem value="spouse">Spouse</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="child">Child</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="insurance-phone">Insurance Phone Number</Label>
                    <Input id="insurance-phone" placeholder="Enter insurance phone number" />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Secondary Insurance</h3>
                  <Switch id="has-secondary" />
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="secondary-provider">Insurance Provider</Label>
                    <Input id="secondary-provider" placeholder="Enter insurance provider" disabled />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="secondary-policy">Policy Number</Label>
                    <Input id="secondary-policy" placeholder="Enter policy number" disabled />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Billing Preferences</h3>
                <div className="space-y-2">
                  <Label htmlFor="billing-method">Preferred Billing Method</Label>
                  <Select>
                    <SelectTrigger id="billing-method">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="insurance">Insurance Only</SelectItem>
                      <SelectItem value="self-pay">Self-Pay</SelectItem>
                      <SelectItem value="mixed">Insurance + Self-Pay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Payment Methods</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="credit-card" />
                      <Label htmlFor="credit-card">Credit Card</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="debit-card" />
                      <Label htmlFor="debit-card">Debit Card</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="cash" />
                      <Label htmlFor="cash">Cash</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="check" />
                      <Label htmlFor="check">Check</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="online" />
                      <Label htmlFor="online">Online Payment</Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Consent & Documents</CardTitle>
              <CardDescription>Manage patient consent forms and documents.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Required Consent Forms</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-md flex-wrap gap-3">
                    <div>
                      <h4 className="font-medium">HIPAA Consent Form</h4>
                      <p className="text-sm text-muted-foreground">Patient consent for use and disclosure of health information</p>
                    </div>
                    <input type="file" id="hipaa-consent" className="hidden" />
                    <Button variant="outline" onClick={() => document.getElementById("hipaa-consent")?.click()}>Upload</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-md flex-wrap gap-3">
                    <div>
                      <h4 className="font-medium">Treatment Consent</h4>
                      <p className="text-sm text-muted-foreground">Consent to receive medical treatment</p>
                    </div>
                    <input type="file" id="treatment-consent" className="hidden" />
                    <Button variant="outline" onClick={() => document.getElementById("treatment-consent")?.click()}>Upload</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-md flex-wrap gap-3">
                    <div>
                      <h4 className="font-medium">Financial Agreement</h4>
                      <p className="text-sm text-muted-foreground">Agreement to pay for services</p>
                    </div>
                    <input type="file" id="financial-agreement" className="hidden" />
                    <Button variant="outline" onClick={() => document.getElementById("financial-agreement")?.click()}>Upload</Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Additional Documents</h3>
                <div className="space-y-2">
                  <Label htmlFor="document-type">Document Type</Label>
                  <Select>
                    <SelectTrigger id="document-type">
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="id">Identification</SelectItem>
                      <SelectItem value="insurance-card">Insurance Card</SelectItem>
                      <SelectItem value="medical-records">Previous Medical Records</SelectItem>
                      <SelectItem value="lab-results">Lab Results</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <Button variant="outline">Upload Document</Button>
                  <p className="text-sm text-muted-foreground">Upload additional patient documents. PDF, JPG, or PNG. Max 10MB.</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Communication Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="appointment-reminders" />
                    <Label htmlFor="appointment-reminders">Receive appointment reminders</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="lab-notifications" />
                    <Label htmlFor="lab-notifications">Receive lab result notifications</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="prescription-notifications" />
                    <Label htmlFor="prescription-notifications">Receive prescription notifications</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="newsletter" />
                    <Label htmlFor="newsletter">Receive clinic newsletter and updates</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {error && <p className="text-red-500 text-center py-4">{error}</p>}


      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={isLoading}>{isLoading ? 'Registering...' : 'Register Patient'}</Button>
      </div>
    </form>
    </div>
  );
}
