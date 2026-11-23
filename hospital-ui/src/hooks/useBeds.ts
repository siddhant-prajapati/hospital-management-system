import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  getBeds,
  addBedToWard as apiAddBed,
  updateBed as apiUpdateBed,
  deleteBed as apiDeleteBed,
  assignPatientToBed as apiAssignPatient,
  releaseBed as apiReleaseBed,
} from '../api/wardApi';
import type { Bed, BedPayload, BedStatus, BedType } from '../types/ward';
import type { Patient } from '../types/patient';

interface UseBedsReturn {
  beds: Bed[];
  loading: boolean;
  error: string | null;
  isUpdating: boolean;
  addBed: (wardId: string, payload: BedPayload) => Promise<Bed>;
  editBed: (bedId: string, payload: BedPayload) => Promise<Bed>;
  removeBed: (bedId: string) => Promise<void>;
  assignPatientToBed: (bedId: string, patient: Patient) => Promise<void>;
  releaseBed: (bedId: string, nextStatus?: Exclude<BedStatus, 'OCCUPIED'>) => Promise<void>;
  refetchBeds: () => Promise<void>;
}

function mapBed(raw: any): Bed {
  return {
    id: String(raw.id),
    bedNumber: raw.bedNumber,
    bedType: (raw.bedType ?? 'STANDARD') as BedType,
    dailyRate: typeof raw.dailyRate === 'number' ? raw.dailyRate : parseFloat(raw.dailyRate ?? '0'),
    notes: raw.notes ?? null,
    wardId: String(raw.wardId ?? ''),
    ward: raw.wardName ?? raw.ward ?? '',
    wardType: raw.wardType ?? '',
    status: (raw.status ?? 'AVAILABLE') as BedStatus,
    patientId: raw.patientId != null ? String(raw.patientId) : null,
    patientName: raw.patientName ?? null,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export function useBeds(): UseBedsReturn {
  const [beds, setBeds] = useState<Bed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchBeds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getBeds();
      const raw = res.data as any;
      const list = Array.isArray(raw) ? raw : (raw?.content ?? []);
      setBeds(list.map(mapBed));
    } catch (err) {
      if (!axios.isCancel(err)) {
        setError('Could not load ward beds. Check if the API server is running.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBeds();
  }, [fetchBeds]);

  const addBed = async (wardId: string, payload: BedPayload): Promise<Bed> => {
    try {
      setIsUpdating(true);
      const res = await apiAddBed(wardId, payload);
      const newBed = mapBed(res.data);
      setBeds((prev) => [...prev, newBed]);
      return newBed;
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to add bed to ward';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  const editBed = async (bedId: string, payload: BedPayload): Promise<Bed> => {
    try {
      setIsUpdating(true);
      const res = await apiUpdateBed(bedId, payload);
      const updated = mapBed(res.data);
      setBeds((prev) => prev.map((b) => (b.id === bedId ? updated : b)));
      return updated;
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to update bed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  const removeBed = async (bedId: string): Promise<void> => {
    try {
      setIsUpdating(true);
      await apiDeleteBed(bedId);
      setBeds((prev) => prev.filter((b) => b.id !== bedId));
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to delete bed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  const assignPatientToBed = async (bedId: string, patient: Patient) => {
    try {
      setIsUpdating(true);
      const res = await apiAssignPatient(bedId, patient);
      setBeds((prev) => prev.map((b) => (b.id === bedId ? mapBed(res.data) : b)));
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to assign patient to bed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  const releaseBed = async (
    bedId: string,
    nextStatus: Exclude<BedStatus, 'OCCUPIED'> = 'AVAILABLE'
  ) => {
    try {
      setIsUpdating(true);
      const res = await apiReleaseBed(bedId, nextStatus);
      setBeds((prev) => prev.map((b) => (b.id === bedId ? mapBed(res.data) : b)));
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to update bed status';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    beds,
    loading,
    error,
    isUpdating,
    addBed,
    editBed,
    removeBed,
    assignPatientToBed,
    releaseBed,
    refetchBeds: fetchBeds,
  };
}
