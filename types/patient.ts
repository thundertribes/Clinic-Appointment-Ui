// Matches actual backend response (Prisma schema -> camelCase API)

export type Gender = "MALE" | "FEMALE";

export type BloodType =
  | "A+"
  | "A-"
  | "B+"
  | "B-"
  | "AB+"
  | "AB-"
  | "O+"
  | "O-";

export interface Doctor {
  id: string;
  name: string;
}

export interface FamilyMedicalHistory {
  diabetes?: boolean;
  hypertension?: boolean;
  asthma?: boolean;
  heartDisease?: boolean;
  cancer?: boolean;
  mentalHealthConditions?: boolean;
  notes?: string;
}

export interface Patient {
  // Required fields
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  phoneNumber: string;
  doctor: Doctor;

  // Optional fields
  publicId?: string;
  middleName?: string;
  email?: string;
  addressLine?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  bloodType?: BloodType;
  heightCm?: number;
  weightKg?: number;
  familyMedicalHistory?: FamilyMedicalHistory;

  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}


// API Response wrapper
export interface PatientsApiResponse {
  success: boolean;
  message: string;
  data: Patient[];
}

// export interface PatientFilterOptions {
//   genders: string[];
// }

export interface PatientFilterOptions {
  genders: string[];
  doctors: string[];
}


export type FilterState = {
  search: string;
  gender: string[];
  doctors: string[];
};

export const DEFAULT_FILTERS: FilterState = {
  search: "",
  gender: [],
  doctors: [],
};
