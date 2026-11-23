import axiosClient from './axiosClient';
import type { Patient, PatientPayload } from '../types/patient';

export const getPatients = () =>
  axiosClient.get<Patient[]>('/patients');

export const getPatientById = (id: string) =>
  axiosClient.get<Patient>(`/patients/${id}`);

export const createPatient = (data: PatientPayload) =>
  axiosClient.post<Patient>('/patients', data);

export const updatePatient = (id: string, data: PatientPayload) =>
  axiosClient.put<Patient>(`/patients/${id}`, data);

export const deletePatient = (id: string) =>
  axiosClient.delete(`/patients/${id}`);

/**
 * Assign an available bed to a patient (Admission workflow)
 * POST /api/v1/patients/{patientId}/assign-bed
 */
export const assignBedToPatient = (patientId: string, bedId: string) =>
  axiosClient.post<Patient>(`/patients/${patientId}/assign-bed`, {
    bedId: Number(bedId),
  });

/**
 * Discharge patient and free assigned bed
 * POST /api/v1/patients/{patientId}/discharge
 */
export const dischargePatient = (patientId: string) =>
  axiosClient.post<Patient>(`/patients/${patientId}/discharge`);
