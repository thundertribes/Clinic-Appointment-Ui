import { getPatients } from "@/lib/patients";
import { PatientListClient } from "@/components/patients/patient-list-client";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Patients Page - SERVER COMPONENT
 *
 * This is a Server Component that:
 * 1. Fetches patient data on the server (fast, secure)
 * 2. Extracts filter options from the data
 * 3. Passes everything to the Client Component for interactivity
 *
 * Benefits:
 * - Initial HTML includes all patient data (no loading spinner)
 * - Backend URL is hidden from client
 * - Filter options are pre-computed on server
 * - SEO-friendly (data in HTML)
 */
export default async function PatientsPage() {
  // Fetch patients on the server
  const { patients, filterOptions, error } = await getPatients();

  // Handle error state
  if (error) {
    return (
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mb-2">
            Patients
          </h1>
          <p className="text-muted-foreground">
            Manage your patients and their medical records.
          </p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <span>{error}</span>
            {error.includes("Unauthorized") && (
              <Button asChild variant="outline" size="sm" className="w-fit">
                <Link href="/auth/login">Go to Login</Link>
              </Button>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Render the client component with server-fetched data
  return (
    <PatientListClient
      initialPatients={patients}
      filterOptions={filterOptions}
    />
  );
}
