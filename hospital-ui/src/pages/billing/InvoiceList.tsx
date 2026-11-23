import { useState } from 'react';
import { Plus, CheckCircle2, Clock, Eye } from 'lucide-react';
import { useInvoices } from '../../hooks/useInvoices';
import { usePatients } from '../../hooks/usePatients';
import { useMedicines } from '../../hooks/useMedicines';
import { useBeds } from '../../hooks/useBeds';
import type { Invoice } from '../../types/billing';
import CreateInvoiceModal from './CreateInvoiceModal';
import InvoiceDetailModal from './InvoiceDetailModal';

export default function InvoiceList() {
  const { invoices, loading, error, isSubmitting, addInvoice, toggleStatus } = useInvoices();
  const { patients } = usePatients();
  const { medicines } = useMedicines();
  const { beds } = useBeds();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const pendingAmount = invoices
    .filter((inv) => inv.status === 'Pending')
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Billing &amp; Invoices</h2>
          <p className="text-sm text-slate-500">Generate itemized, GST-compliant hospital invoices</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg bg-sky-600 hover:bg-sky-700"
        >
          <Plus className="w-4 h-4" />
          New Invoice
        </button>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="p-4 bg-white border rounded-xl border-slate-200">
          <p className="text-xs font-semibold uppercase text-slate-500">Total Billed Revenue</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">
            ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="p-4 bg-white border rounded-xl border-slate-200">
          <p className="text-xs font-semibold uppercase text-slate-500">Pending Dues</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">
            ₹{pendingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="overflow-hidden bg-white border rounded-xl border-slate-200">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading invoices...</div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-600">{error}</div>
        ) : invoices.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">No invoices generated yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase border-b bg-slate-50 text-slate-500 border-slate-200">
                <tr>
                  <th className="px-6 py-3">Invoice #</th>
                  <th className="px-6 py-3">Patient</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Items</th>
                  <th className="px-6 py-3">GST</th>
                  <th className="px-6 py-3">Total Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-700">
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{inv.patientName}</td>
                    <td className="px-6 py-4 text-slate-600">{inv.date}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {inv.items.length} {inv.items.length === 1 ? 'charge' : 'charges'}
                    </td>
                    <td className="px-6 py-4 text-slate-600">₹{inv.gstAmount.toFixed(2)}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      ₹{inv.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                          inv.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {inv.status === 'Paid' ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <Clock className="w-3.5 h-3.5" />
                        )}
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                      <button
                        onClick={() => toggleStatus(inv)}
                        className="px-3 py-1 text-xs font-semibold rounded-lg text-sky-700 bg-sky-50 hover:bg-sky-100"
                      >
                        Mark {inv.status === 'Paid' ? 'Pending' : 'Paid'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Invoice Modal */}
      {isCreateModalOpen && (
        <CreateInvoiceModal
          patients={patients}
          medicines={medicines}
          beds={beds}
          isSubmitting={isSubmitting}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={addInvoice}
        />
      )}

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onToggleStatus={toggleStatus}
        />
      )}
    </div>
  );
}
