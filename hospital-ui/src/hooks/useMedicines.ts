import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  getMedicines,
  createMedicine as apiCreateMedicine,
  updateMedicine as apiUpdateMedicine,
  updateMedicineStock as apiUpdateStock,
  deleteMedicine as apiDeleteMedicine,
} from '../api/pharmacyApi';
import type { Medicine, MedicinePayload } from '../types/pharmacy';

function mapMedicine(raw: any): Medicine {
  return {
    id: String(raw.id),
    name: raw.name,
    category: raw.category,
    stock: Number(raw.stock ?? 0),
    minThreshold: Number(raw.minThreshold ?? 0),
    unitPrice: typeof raw.unitPrice === 'number' ? raw.unitPrice : parseFloat(raw.unitPrice ?? '0'),
    gstRate: typeof raw.gstRate === 'number' ? raw.gstRate : parseFloat(raw.gstRate ?? '0'),
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export function useMedicines() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMedicines = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMedicines();
      const data = res.data as any;
      const list = Array.isArray(data) ? data : (data?.content ?? []);
      setMedicines(list.map(mapMedicine));
    } catch (err) {
      if (!axios.isCancel(err)) {
        setError('Could not load pharmacy inventory.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  const addMedicine = async (payload: MedicinePayload): Promise<Medicine> => {
    try {
      setIsSubmitting(true);
      const res = await apiCreateMedicine(payload);
      const newMed = mapMedicine(res.data);
      setMedicines((prev) => [...prev, newMed]);
      return newMed;
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to add medicine';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const editMedicine = async (id: string, payload: MedicinePayload): Promise<Medicine> => {
    try {
      setIsSubmitting(true);
      const res = await apiUpdateMedicine(id, payload);
      const updated = mapMedicine(res.data);
      setMedicines((prev) => prev.map((m) => (m.id === id ? updated : m)));
      return updated;
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to update medicine';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeMedicine = async (id: string): Promise<void> => {
    try {
      setIsSubmitting(true);
      await apiDeleteMedicine(id);
      setMedicines((prev) => prev.filter((m) => m.id !== id));
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to delete medicine';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const adjustStock = async (medicine: Medicine, delta: number) => {
    const nextStock = Math.max(0, medicine.stock + delta);
    const res = await apiUpdateStock(medicine.id, nextStock);
    const updated = mapMedicine(res.data);
    setMedicines((prev) => prev.map((m) => (m.id === medicine.id ? updated : m)));
  };

  return {
    medicines,
    loading,
    error,
    isSubmitting,
    addMedicine,
    editMedicine,
    removeMedicine,
    adjustStock,
    refetchMedicines: fetchMedicines,
  };
}
