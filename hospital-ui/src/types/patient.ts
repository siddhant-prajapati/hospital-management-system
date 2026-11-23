export type Gender = 'Male' | 'Female' | 'Other';
export type VisitType = 'OPD' | 'IPD';
export type PatientStatus = 'Active' | 'Admitted' | 'Discharged';

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  phone: string;
  type: VisitType;
  status: PatientStatus;
  assignedBedId?: string | null;
  assignedBedNumber?: string | null;
  assignedWardName?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type PatientPayload = Omit<
  Patient,
  'id' | 'assignedBedId' | 'assignedBedNumber' | 'assignedWardName' | 'createdAt' | 'updatedAt'
>;
