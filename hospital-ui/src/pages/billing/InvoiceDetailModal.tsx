import { X, CheckCircle2, Clock, Printer } from 'lucide-react';
import type { Invoice } from '../../types/billing';

interface InvoiceDetailModalProps {
  invoice: Invoice;
  onClose: () => void;
  onToggleStatus: (invoice: Invoice) => Promise<void>;
}

export default function InvoiceDetailModal({
  invoice,
  onClose,
  onToggleStatus,
}: InvoiceDetailModalProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-800">
                Invoice {invoice.invoiceNumber}
              </h3>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                  invoice.status === 'Paid'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {invoice.status === 'Paid' ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <Clock className="w-3 h-3" />
                )}
                {invoice.status}
              </span>
            </div>
            <p className="text-xs text-slate-500">Issued on {invoice.date}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100"
              title="Print Invoice"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Patient Details Strip */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Billed Patient</p>
              <p className="mt-0.5 font-bold text-slate-800">{invoice.patientName}</p>
              <p className="text-xs text-slate-500">Patient ID: {invoice.patientId}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase text-slate-400">Payment Status</p>
              <p
                className={`mt-0.5 font-bold ${
                  invoice.status === 'Paid' ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {invoice.status === 'Paid' ? 'Paid in Full' : 'Pending Payment'}
              </p>
              <p className="text-xs text-slate-500">Tax Invoice / GST Compliant</p>
            </div>
          </div>

          {/* Itemized Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Itemized Charges &amp; Services
            </h4>
            <div className="overflow-hidden border rounded-lg border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 uppercase text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5">Description</th>
                    <th className="px-4 py-2.5 text-center">Qty</th>
                    <th className="px-4 py-2.5 text-right">Unit Price</th>
                    <th className="px-4 py-2.5 text-center">GST %</th>
                    <th className="px-4 py-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoice.items.map((item, idx) => {
                    const lineBase = item.quantity * item.unitPrice;
                    const lineGst = (lineBase * item.gstRate) / 100;
                    const lineTotal = lineBase + lineGst;
                    return (
                      <tr key={item.id || idx}>
                        <td className="px-4 py-2.5 font-medium text-slate-800">
                          {item.description}
                        </td>
                        <td className="px-4 py-2.5 text-center text-slate-600">{item.quantity}</td>
                        <td className="px-4 py-2.5 text-right text-slate-600">
                          ₹{item.unitPrice.toFixed(2)}
                        </td>
                        <td className="px-4 py-2.5 text-center text-slate-600">{item.gstRate}%</td>
                        <td className="px-4 py-2.5 text-right font-semibold text-slate-800">
                          ₹{lineTotal.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Strip */}
          <div className="ml-auto w-64 space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-medium">₹{invoice.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Total GST:</span>
              <span className="font-medium">₹{invoice.gstAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200 text-base font-bold text-slate-900">
              <span>Grand Total:</span>
              <span className="text-sky-700">₹{invoice.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={() => onToggleStatus(invoice)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              invoice.status === 'Paid'
                ? 'bg-amber-50 text-amber-700 border border-amber-300 hover:bg-amber-100'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            Mark as {invoice.status === 'Paid' ? 'Pending' : 'Paid'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg text-slate-600 bg-white border border-slate-300 hover:bg-slate-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
