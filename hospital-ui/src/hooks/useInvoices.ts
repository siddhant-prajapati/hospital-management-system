import { useEffect, useState } from 'react';
import axios from 'axios';
import { getInvoices, createInvoice, updateInvoiceStatus } from '../api/billingApi';
import type { Invoice, InvoicePayload, InvoiceStatus } from '../types/billing';

function mapInvoice(raw: any): Invoice {
  return {
    id: String(raw.id),
    invoiceNumber: raw.invoiceNumber,
    patientId: String(raw.patientId),
    patientName: raw.patientName,
    date: raw.date,
    items: (raw.items ?? []).map((item: any) => ({
      id: item.clientId ?? String(item.id),
      description: item.description,
      quantity: item.quantity,
      unitPrice: typeof item.unitPrice === 'number' ? item.unitPrice : parseFloat(item.unitPrice ?? '0'),
      gstRate: typeof item.gstRate === 'number' ? item.gstRate : parseFloat(item.gstRate ?? '0'),
    })),
    subtotal: typeof raw.subtotal === 'number' ? raw.subtotal : parseFloat(raw.subtotal ?? '0'),
    gstAmount: typeof raw.gstAmount === 'number' ? raw.gstAmount : parseFloat(raw.gstAmount ?? '0'),
    totalAmount: typeof raw.totalAmount === 'number' ? raw.totalAmount : parseFloat(raw.totalAmount ?? '0'),
    status: raw.status as InvoiceStatus,
  };
}

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchInvoices() {
      try {
        setLoading(true);
        setError(null);
        const res = await getInvoices({ signal: controller.signal });
        const data = res.data as any;
        const list = Array.isArray(data) ? data : (data?.content ?? []);
        setInvoices(list.map(mapInvoice));
      } catch (err) {
        if (!axios.isCancel(err)) {
          setError('Could not load invoices.');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchInvoices();
    return () => controller.abort();
  }, []);

  const addInvoice = async (data: InvoicePayload) => {
    try {
      setIsSubmitting(true);
      const res = await createInvoice(data);
      setInvoices((prev) => [mapInvoice(res.data), ...prev]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (invoice: Invoice) => {
    const nextStatus: InvoiceStatus = invoice.status === 'Paid' ? 'Pending' : 'Paid';
    const res = await updateInvoiceStatus(invoice.id, nextStatus);
    setInvoices((prev) => prev.map((inv) => (inv.id === invoice.id ? mapInvoice(res.data) : inv)));
  };

  return { invoices, loading, error, isSubmitting, addInvoice, toggleStatus };
}
