import { useMemo, useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { Patient } from '../../types/patient';
import type { Medicine } from '../../types/pharmacy';
import type { Bed } from '../../types/ward';
import type { InvoiceItem, InvoicePayload } from '../../types/billing';

interface CreateInvoiceModalProps {
  patients: Patient[];
  medicines: Medicine[];
  beds?: Bed[];
  isSubmitting: boolean;
  onClose: () => void;
  onSave: (payload: InvoicePayload) => Promise<void>;
}

const createEmptyRow = (): InvoiceItem => ({
  id: crypto.randomUUID(),
  description: '',
  quantity: 1,
  unitPrice: 0,
  gstRate: 0,
});

export default function CreateInvoiceModal({
  patients,
  medicines,
  beds = [],
  isSubmitting,
  onClose,
  onSave,
}: CreateInvoiceModalProps) {
  const [patientId, setPatientId] = useState(patients[0]?.id ?? '');
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: crypto.randomUUID(), description: 'General Consultation', quantity: 1, unitPrice: 500, gstRate: 0 },
  ]);

  const addEmptyRow = () => setItems((prev) => [...prev, createEmptyRow()]);

  const addMedicineRow = (medId: string) => {
    const med = medicines.find((m) => m.id === medId);
    if (!med) return;
    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        description: `Rx: ${med.name}`,
        quantity: 1,
        unitPrice: med.unitPrice,
        gstRate: med.gstRate,
      },
    ]);
  };

  const addBedRow = (bedId: string) => {
    const bed = beds.find((b) => b.id === bedId);
    if (!bed) return;
    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        description: `Inpatient Bed Charge (${bed.ward} - Bed ${bed.bedNumber})`,
        quantity: 1,
        unitPrice: bed.dailyRate,
        gstRate: 0, // Healthcare bed charge typically exempt/0%
      },
    ]);
  };

  const updateItem = <K extends keyof InvoiceItem>(
    id: string,
    field: K,
    value: InvoiceItem[K]
  ) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Memoized totals calculation
  const totals = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        const lineBase = item.quantity * item.unitPrice;
        const lineGst = (lineBase * item.gstRate) / 100;
        acc.subtotal += lineBase;
        acc.gstAmount += lineGst;
        acc.totalAmount += lineBase + lineGst;
        return acc;
      },
      { subtotal: 0, gstAmount: 0, totalAmount: 0 }
    );
  }, [items]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => String(p.id) === String(patientId));
    if (!patient || items.length === 0) return;

    await onSave({
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: String(patient.id),
      patientName: patient.name,
      date: new Date().toISOString().split('T')[0],
      items,
      subtotal: Number(totals.subtotal.toFixed(2)),
      gstAmount: Number(totals.gstAmount.toFixed(2)),
      totalAmount: Number(totals.totalAmount.toFixed(2)),
      status: 'Pending',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-white rounded-xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">Generate Patient Invoice</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-5 overflow-y-auto">
          {/* Patient Selection & Quick Add Dropdowns */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Patient</label>
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                required
                className="w-full px-3 py-2 mt-1 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.phone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                + Pharmacy Medicine
              </label>
              <select
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) {
                    addMedicineRow(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="w-full px-3 py-2 mt-1 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">Select medication...</option>
                {medicines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} — ₹{m.unitPrice} ({m.gstRate}% GST)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                + Inpatient Bed Charge
              </label>
              <select
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) {
                    addBedRow(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="w-full px-3 py-2 mt-1 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">Select bed rate...</option>
                {beds.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.bedNumber} ({b.ward} - {b.bedType}) — ₹{b.dailyRate}/day
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">Line Items &amp; Charges</span>
              <button
                type="button"
                onClick={addEmptyRow}
                className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700"
              >
                <Plus className="w-4 h-4" /> Add Custom Line Item
              </button>
            </div>

            {items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-12 gap-2 p-3 border rounded-lg bg-slate-50 border-slate-200 items-center"
              >
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                  placeholder="Charge Description (e.g. Lab Test, Consultation)"
                  required
                  className="col-span-12 sm:col-span-5 px-2.5 py-1.5 text-sm bg-white border rounded border-slate-300"
                />
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => updateItem(item.id, 'quantity', Math.max(1, Number(e.target.value)))}
                  className="col-span-4 sm:col-span-2 px-2.5 py-1.5 text-sm bg-white border rounded border-slate-300"
                  title="Quantity"
                />
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(item.id, 'unitPrice', Math.max(0, Number(e.target.value)))}
                  className="col-span-4 sm:col-span-2 px-2.5 py-1.5 text-sm bg-white border rounded border-slate-300"
                  title="Unit Price (₹)"
                />
                <select
                  value={item.gstRate}
                  onChange={(e) => updateItem(item.id, 'gstRate', Number(e.target.value))}
                  className="col-span-3 sm:col-span-2 px-2 py-1.5 text-sm bg-white border rounded border-slate-300"
                  title="GST Rate"
                >
                  <option value={0}>0% GST</option>
                  <option value={5}>5% GST</option>
                  <option value={12}>12% GST</option>
                  <option value={18}>18% GST</option>
                </select>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  disabled={items.length === 1}
                  className="col-span-1 flex justify-center text-slate-400 hover:text-red-600 disabled:opacity-30"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Totals Summary */}
          <div className="p-4 ml-auto space-y-1.5 text-sm border rounded-xl bg-slate-50 border-slate-200 sm:w-72">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>₹{totals.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Total GST</span>
              <span>₹{totals.gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between pt-2 text-base font-bold border-t text-slate-900 border-slate-200">
              <span>Grand Total</span>
              <span className="text-sky-700">₹{totals.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg text-slate-600 bg-slate-100 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !patientId}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Generating...' : 'Save & Generate Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
