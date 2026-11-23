import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  getActiveWards,
  createWard as apiCreateWard,
  updateWard as apiUpdateWard,
  deactivateWard as apiDeactivateWard,
} from '../api/wardApi';
import type { Ward, WardPayload } from '../types/ward';

function mapWard(raw: any): Ward {
  return {
    id: String(raw.id),
    wardName: raw.wardName,
    wardType: raw.wardType,
    totalCapacity: Number(raw.totalCapacity ?? 0),
    floorNumber: raw.floorNumber != null ? Number(raw.floorNumber) : null,
    wing: raw.wing ?? null,
    isActive: Boolean(raw.isActive ?? true),
    availableBeds: Number(raw.availableBeds ?? 0),
    occupiedBeds: Number(raw.occupiedBeds ?? 0),
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export function useWards() {
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchWards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getActiveWards();
      const raw = res.data as any;
      const list = Array.isArray(raw) ? raw : (raw?.content ?? []);
      setWards(list.map(mapWard));
    } catch (err) {
      if (!axios.isCancel(err)) {
        setError('Could not load wards from backend.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWards();
  }, [fetchWards]);

  const addWard = async (payload: WardPayload) => {
    try {
      setIsSubmitting(true);
      const res = await apiCreateWard(payload);
      const newWard = mapWard(res.data);
      setWards((prev) => [...prev, newWard]);
      return newWard;
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to create ward';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const editWard = async (id: string, payload: WardPayload) => {
    try {
      setIsSubmitting(true);
      const res = await apiUpdateWard(id, payload);
      const updated = mapWard(res.data);
      setWards((prev) => prev.map((w) => (w.id === id ? updated : w)));
      return updated;
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to update ward';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeWard = async (id: string) => {
    try {
      setIsSubmitting(true);
      await apiDeactivateWard(id);
      setWards((prev) => prev.filter((w) => w.id !== id));
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to deactivate ward';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    wards,
    loading,
    error,
    isSubmitting,
    addWard,
    editWard,
    removeWard,
    refetchWards: fetchWards,
  };
}
