import type { AxiosRequestConfig } from 'axios';
import axiosClient from './axiosClient';
import type { Bed, BedPayload, Ward, WardPayload } from '../types/ward';
import type { Patient } from '../types/patient';

// ── Ward Endpoints ─────────────────────────────────────────────────────────────

export const getWards = (config?: AxiosRequestConfig) =>
  axiosClient.get<Ward[]>('/wards', config);

export const getActiveWards = (config?: AxiosRequestConfig) =>
  axiosClient.get<Ward[]>('/wards/active', config);

export const createWard = (data: WardPayload) =>
  axiosClient.post<Ward>('/wards', data);

export const updateWard = (wardId: string, data: WardPayload) =>
  axiosClient.put<Ward>(`/wards/${wardId}`, data);

export const deactivateWard = (wardId: string) =>
  axiosClient.delete(`/wards/${wardId}`);

// ── Bed Endpoints ──────────────────────────────────────────────────────────────

export const getBeds = (config?: AxiosRequestConfig) =>
  axiosClient.get<Bed[]>('/beds', config);

export const getBedsByWard = (wardId: string, config?: AxiosRequestConfig) =>
  axiosClient.get<Bed[]>(`/wards/${wardId}/beds`, config);

export const addBedToWard = (wardId: string, data: BedPayload) =>
  axiosClient.post<Bed>(`/wards/${wardId}/beds`, data);

export const updateBed = (bedId: string, data: BedPayload) =>
  axiosClient.put<Bed>(`/beds/${bedId}`, data);

export const deleteBed = (bedId: string) =>
  axiosClient.delete(`/beds/${bedId}`);

/**
 * Assign a patient to a bed → POST /beds/{id}/assign (or PATCH)
 */
export const assignPatientToBed = (bedId: string, patient: Patient) =>
  axiosClient.post<Bed>(`/beds/${bedId}/assign`, {
    patientId: Number(patient.id),
    patientName: patient.name,
  });

/**
 * Release / change bed status → POST /beds/{id}/status (or PATCH)
 */
export const releaseBed = (bedId: string, status: string = 'AVAILABLE') =>
  axiosClient.post<Bed>(`/beds/${bedId}/status`, { status });
