import type { AxiosRequestConfig } from 'axios';
import axiosClient from './axiosClient';
import type { Invoice, InvoicePayload, InvoiceStatus } from '../types/billing';

export const getInvoices = (config?: AxiosRequestConfig) =>
  axiosClient.get<Invoice[]>('/invoices', config);

export const createInvoice = (data: InvoicePayload) =>
  axiosClient.post<Invoice>('/invoices', data);

export const updateInvoiceStatus = (id: string, status: InvoiceStatus) =>
  axiosClient.patch<Invoice>(`/invoices/${id}`, { status });
