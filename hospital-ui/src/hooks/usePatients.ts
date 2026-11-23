import { useEffect, useState, useCallback } from 'react';
import {
  getPatients,
  createPatient,
  updatePatient,
  deletePatient,
  assignBedToPatient,
  dischargePatient as apiDischargePatient,
} from '../api/patientApi';
import type { Patient, PatientPayload } from '../types/patient';

interface UsePatientsReturn {
  patients: Patient[];
  loading: boolean;
  error: string | null;
  isSubmitting: boolean;
  addPatient: (data: PatientPayload) => Promise<void>;
  editPatient: (id: string, data: PatientPayload) => Promise<void>;
  removePatient: (id: string) => Promise<void>;
  assignBed: (patientId: string, bedId: string) => Promise<Patient>;
  dischargePatient: (patientId: string) => Promise<Patient>;
  refetchPatients: () => Promise<void>;
}

export function usePatients(): UsePatientsReturn {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPatients();
      const data = response.data;
      setPatients(Array.isArray(data) ? data : []);
    } catch (err: any) {
      if (err?.code !== 'ERR_CANCELED') {
        setError('Failed to fetch patients. Is the backend running?');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const addPatient = async (data: PatientPayload) => {
    setIsSubmitting(true);
    try {
      const response = await createPatient(data);
      setPatients((prev) => [...prev, response.data]);
    } catch (err) {
      setError('Failed to create patient');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const editPatient = async (id: string, data: PatientPayload) => {
    setIsSubmitting(true);
    try {
      const response = await updatePatient(id, data);
      setPatients((prev) => prev.map((p) => (String(p.id) === String(id) ? response.data : p)));
    } catch (err) {
      setError('Failed to update patient');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const removePatient = async (id: string) => {
    setIsSubmitting(true);
    try {
      await deletePatient(id);
      setPatients((prev) => prev.filter((p) => String(p.id) !== String(id)));
    } catch (err) {
      setError('Failed to delete patient');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const assignBed = async (patientId: string, bedId: string): Promise<Patient> => {
    setIsSubmitting(true);
    try {
      const response = await assignBedToPatient(patientId, bedId);
      const updated = response.data;
      setPatients((prev) => prev.map((p) => (String(p.id) === String(patientId) ? updated : p)));
      return updated;
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to assign bed to patient';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const dischargePatient = async (patientId: string): Promise<Patient> => {
    setIsSubmitting(true);
    try {
      const response = await apiDischargePatient(patientId);
      const updated = response.data;
      setPatients((prev) => prev.map((p) => (String(p.id) === String(patientId) ? updated : p)));
      return updated;
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to discharge patient';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    patients,
    loading,
    error,
    isSubmitting,
    addPatient,
    editPatient,
    removePatient,
    assignBed,
    dischargePatient,
    refetchPatients: fetchPatients,
  };
}
