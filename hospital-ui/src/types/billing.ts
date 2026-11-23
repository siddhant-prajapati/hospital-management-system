export type InvoiceStatus = 'Paid' | 'Pending';

export interface InvoiceItem {
  id: string;
  clientId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  gstRate: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  date: string;
  items: InvoiceItem[];
  subtotal: number;
  gstAmount: number;
  totalAmount: number;
  status: InvoiceStatus;
  createdAt?: string;
  updatedAt?: string;
}

export type InvoicePayload = Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>;
