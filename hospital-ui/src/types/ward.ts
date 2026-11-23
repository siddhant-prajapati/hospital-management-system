// WardType values match backend WardType enum names
export type WardType =
  | 'GENERAL'
  | 'ICU'
  | 'MATERNITY'
  | 'PAEDIATRIC'
  | 'SURGICAL'
  | 'PSYCHIATRIC'
  | 'EMERGENCY'
  | 'ISOLATION'
  | 'ONCOLOGY'
  | 'CARDIAC';

// BedType values match backend BedType enum names
export type BedType = 'STANDARD' | 'DELUXE' | 'ICU' | 'VENTILATOR' | 'ISOLATION';

// BedStatus values match backend BedStatus enum names
export type BedStatus = 'AVAILABLE' | 'OCCUPIED' | 'UNDER_MAINTENANCE' | 'RESERVED';

export interface Ward {
  id: string;
  wardName: string;
  wardType: WardType;
  totalCapacity: number;
  floorNumber?: number | null;
  wing?: string | null;
  isActive: boolean;
  availableBeds: number;
  occupiedBeds: number;
  createdAt?: string;
  updatedAt?: string;
}

export type WardPayload = {
  wardName: string;
  wardType: WardType;
  totalCapacity: number;
  floorNumber?: number | null;
  wing?: string | null;
};

export interface Bed {
  id: string;
  bedNumber: string;
  bedType: BedType;
  dailyRate: number;
  notes?: string | null;
  wardId: string;
  ward: string;        // wardName from backend
  wardType: string;    // wardType string from backend
  status: BedStatus;
  patientId: string | null;
  patientName: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type BedPayload = {
  bedNumber: string;
  bedType: BedType;
  dailyRate: number;
  notes?: string;
  status?: BedStatus;
};

export type BedUpdatePayload = Partial<Omit<Bed, 'id'>>;
