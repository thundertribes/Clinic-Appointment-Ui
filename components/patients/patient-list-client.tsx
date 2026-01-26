"use client";

import type React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// UI Components
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Icons
import { Download, Filter, Loader2, MoreHorizontal, Plus, Search, X } from "lucide-react";

// Types
import type { Patient, PatientFilterOptions, FilterState } from "@/types/patient";
import { DEFAULT_FILTERS } from "@/types/patient";

interface PatientListClientProps {
  initialPatients: Patient[];
  filterOptions: PatientFilterOptions;
}

export function PatientListClient({
  initialPatients,
  filterOptions,
}: PatientListClientProps) {
  const router = useRouter();

  // ==================== STATE ====================

  // Filter state
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtered patients (derived from initialPatients + filters)
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>(initialPatients);

  // UI state
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<string | null>(null);

  
  // ==================== FILTERING LOGIC ====================

  // Apply filters when filters state changes
  useEffect(() => {
    let result = initialPatients;

    // 1. Search filter (name, phone)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter((patient) => {
        const fullName = [patient.firstName, patient.middleName, patient.lastName]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return fullName.includes(searchLower) || patient.phoneNumber?.includes(searchLower);
      });
    }

    // 2. Gender filter (multi-select)
    if (filters.gender.length > 0) {
      result = result.filter(
        (patient) => patient.gender && filters.gender.includes(patient.gender)
      );
    }

    // 3. Doctor filter (multi-select)
    if (filters.doctors.length > 0) {
      result = result.filter(
        (patient) => patient.doctor?.name && filters.doctors.includes(patient.doctor.name)
      );
    }


    setFilteredPatients(result);

    // Calculate active filter count
    let count = 0;
    if (filters.search) count++;
    if (filters.gender.length > 0) count++;
    if (filters.doctors.length > 0) count++;

    setActiveFilterCount(count);
  }, [initialPatients, filters]);

  // ==================== EVENT HANDLERS ====================

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
  };

  const handleGenderChange = (gender: string) => {
    setFilters((prev) => ({
      ...prev,
      gender: prev.gender.includes(gender)
        ? prev.gender.filter((g) => g !== gender)
        : [...prev.gender, gender],
    }));
  };

  const handleDoctorChange = (doctor: string) => {
    setFilters((prev) => ({
      ...prev,
      doctors: prev.doctors.includes(doctor)
        ? prev.doctors.filter((d) => d !== doctor)
        : [...prev.doctors, doctor],
    }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const handleDeleteClick = (patientId: string) => {
    setPatientToDelete(patientId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!patientToDelete) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/patients/${patientToDelete}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        setDeleteDialogOpen(false);
        setPatientToDelete(null);
        // Force refresh the page to load updated list
        router.refresh();
      } else {
        const result = await response.json();
        console.error("Failed to delete patient:", result.message);
      }
    } catch (error) {
      console.error("Error deleting patient:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // ==================== RENDER ====================

  return (
    <>
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mb-2">
              Patients
            </h1>
            <p className="text-muted-foreground">
              Manage your patients and their medical records.
            </p>
          </div>
          <Button asChild>
            <Link href="/patients/add">
              <Plus className="mr-2 h-4 w-4" />
              Add Patient
            </Link>
          </Button>
        </div>

        {/* Main Card */}
        <Card>
          <CardHeader className="flex flex-col space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <CardTitle>Patients List</CardTitle>
                <CardDescription>
                  A list of all patients in your clinic with their details.
                </CardDescription>
              </div>

              {/* Search & Filters */}
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search patients..."
                    className="pl-8 w-full md:w-[250px]"
                    value={filters.search}
                    onChange={handleSearchChange}
                  />
                </div>

                {/* Filter Popover */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="relative">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                      {activeFilterCount > 0 && (
                        <Badge className="ml-2 bg-primary text-primary-foreground">
                          {activeFilterCount}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] md:w-[400px]" align="end">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Filters</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={resetFilters}
                          className="h-8 px-2"
                        >
                          Reset
                          <X className="ml-2 h-4 w-4" />
                        </Button>
                      </div>

                      {/* Gender Filter */}
                      <div className="space-y-2">
                        <Label>Gender</Label>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="male"
                              checked={filters.gender.includes("MALE")}
                              onCheckedChange={() => handleGenderChange("MALE")}
                            />
                            <label htmlFor="male">Male</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="female"
                              checked={filters.gender.includes("FEMALE")}
                              onCheckedChange={() => handleGenderChange("FEMALE")}
                            />
                            <label htmlFor="female">Female</label>
                          </div>
                        </div>
                      </div>

                      {/* Blood Type Filter */}
                      {filterOptions.doctors.length > 0 && (
                        <div className="space-y-2">
                          <Label>Doctors</Label>
                          <div className="max-h-[150px] overflow-y-auto space-y-2 pr-2">
                            {filterOptions.doctors.map((doctor) => (
                              <div key={doctor} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`bloodType-${doctor}`}
                                  checked={filters.doctors.includes(doctor)}
                                  onCheckedChange={() => handleDoctorChange(doctor)}
                                />
                                <label
                                  htmlFor={`bloodType-${doctor}`}
                                  className="text-sm"
                                >
                                  {doctor}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Download Button */}
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Download</span>
                </Button>
              </div>
            </div>

            {/* Active Filters Display */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2">
                {filters.gender.map((gender) => (
                  <Badge
                    key={gender}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {gender}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => handleGenderChange(gender)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}

                {filters.doctors.map((doctor) => (
                  <Badge
                    key={doctor}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    Doctor: {doctor}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => handleDoctorChange(doctor)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}

                {filters.search && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Search: {filters.search}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => setFilters((prev) => ({ ...prev, search: "" }))}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="h-7 px-2 text-xs"
                >
                  Clear all
                </Button>
              </div>
            )}
          </CardHeader>

          <CardContent>
            {filteredPatients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="rounded-full bg-muted p-3 mb-3">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No patients found</h3>
                <p className="text-muted-foreground mt-1 mb-4 max-w-md">
                  No patients match your current filters. Try adjusting your search or
                  filter criteria.
                </p>
                <Button variant="outline" onClick={resetFilters}>
                  Reset all filters
                </Button>
              </div>
            ) : (
              <Table className="whitespace-nowrap">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead className="table-cell">Gender</TableHead>
                    <TableHead className="table-cell">Doctor</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="whitespace-nowrap">
                  {filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>{patient.firstName} {patient.lastName}</TableCell>
                      <TableCell>{patient.phoneNumber || "N/A"}</TableCell>
                      <TableCell>{patient.age || "N/A"}</TableCell>
                      <TableCell className="table-cell capitalize">
                        {patient.gender?.toLowerCase() || "N/A"}
                      </TableCell>
                      <TableCell>{patient.doctor?.name || "N/A"}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link href={`/patients/${patient.id}`}>View profile</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/patients/${patient.id}/edit`}>
                                Edit details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(patient.id)}
                              className="text-red-600"
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this patient?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The patient&apos;s data will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-500 text-neutral-50 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
