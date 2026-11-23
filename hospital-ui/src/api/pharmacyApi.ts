import type { AxiosRequestConfig } from 'axios';
import axiosClient from './axiosClient';
import type { Medicine, MedicinePayload } from '../types/pharmacy';

export const getMedicines = (config?: AxiosRequestConfig) =>
  axiosClient.get<Medicine[]>('/medicines', config);

export const getMedicineById = (id: string) =>
  axiosClient.get<Medicine>(`/medicines/${id}`);

export const createMedicine = (data: MedicinePayload) =>
  axiosClient.post<Medicine>('/medicines', data);

export const updateMedicine = (id: string, data: MedicinePayload) =>
  axiosClient.put<Medicine>(`/medicines/${id}`, data);

export const updateMedicineStock = (id: string, stock: number) =>
  axiosClient.patch<Medicine>(`/medicines/${id}`, { stock });

export const deleteMedicine = (id: string) =>
  axiosClient.delete(`/medicines/${id}`);
