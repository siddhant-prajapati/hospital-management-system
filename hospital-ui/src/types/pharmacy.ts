export interface Medicine {
  id: string;
  name: string;
  category: string;
  stock: number;
  minThreshold: number;
  unitPrice: number;
  gstRate: number;
  createdAt?: string;
  updatedAt?: string;
}

export type MedicinePayload = Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>;
