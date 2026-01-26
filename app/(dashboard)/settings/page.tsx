import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Building, Globe, Mail, Phone, MapPin, FileText, AlertTriangle } from "lucide-react";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL;

// Type definitions matching the API response
interface EmergencyContact {
  name: string | null;
  phone: string | null;
  instructions: string | null;
}

interface ClinicDetails {
  name: string;
  phone: string;
  email: string;
  emergencyContact: EmergencyContact;
  taxId: string | null;
  regNo: string | null;
  address: string;
  website: string | null;
}

// Fetch clinic details server-side
async function getClinicDetails(): Promise<ClinicDetails | null> {
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
    const response = await fetch(`${BACKEND_URL}/clinic/details`, {
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

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching clinic details:", error);
    return null;
  }
}

export default async function SettingsPage() {
  const clinic = await getClinicDetails();

  if (!clinic) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold">Clinic Settings</h2>
          <p className="text-sm text-muted-foreground">View your clinic information</p>
        </div>
        <Card>
          <CardContent className="py-10">
            <p className="text-center text-muted-foreground">Failed to load clinic details.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold">Clinic Settings</h2>
        <p className="text-sm text-muted-foreground">View your clinic information</p>
      </div>

      {/* Clinic Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="mr-2 h-5 w-5" />
            Clinic Information
          </CardTitle>
          <CardDescription>Your clinic&apos;s basic information and contact details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Clinic Name */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Clinic Name</p>
            <p className="text-lg font-semibold">{clinic.name}</p>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center">
                <Phone className="mr-2 h-4 w-4" />
                Phone Number
              </p>
              <p>{clinic.phone || "Not provided"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center">
                <Mail className="mr-2 h-4 w-4" />
                Email Address
              </p>
              <p>{clinic.email || "Not provided"}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center">
                <Globe className="mr-2 h-4 w-4" />
                Website
              </p>
              <p>{clinic.website || "Not provided"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center">
                <MapPin className="mr-2 h-4 w-4" />
                Address
              </p>
              <p>{clinic.address || "Not provided"}</p>
            </div>
          </div>

          <Separator />

          {/* Registration & Tax Information */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                Registration Number
              </p>
              <p>{clinic.regNo || "Not provided"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                Tax ID
              </p>
              <p>{clinic.taxId || "Not provided"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Emergency Contact
          </CardTitle>
          <CardDescription>Emergency contact information for your clinic</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Contact Name</p>
              <p>{clinic.emergencyContact?.name || "Not provided"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center">
                <Phone className="mr-2 h-4 w-4" />
                Emergency Phone
              </p>
              <p>{clinic.emergencyContact?.phone || "Not provided"}</p>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Emergency Instructions</p>
            <p className="text-sm">{clinic.emergencyContact?.instructions || "No instructions provided"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
