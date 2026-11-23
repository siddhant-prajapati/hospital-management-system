import { useState } from 'react';
import { X } from 'lucide-react';
import type { Medicine, MedicinePayload } from '../../types/pharmacy';

const COMMON_CATEGORIES = [
  'Antibiotics',
  'Analgesics',
  'Antipyretics',
  'Cardiology',
  'Respiratory',
  'Gastrointestinal',
  'Vitamins & Supplements',
  'Emergency Care',
];

interface MedicineFormModalProps {
  initialData?: Medicine | null;
  onClose: () => void;
  onSave: (payload: MedicinePayload) => Promise<any>;
  isSubmitting: boolean;
}

export default function MedicineFormModal({
  initialData,
  onClose,
  onSave,
  isSubmitting,
}: MedicineFormModalProps) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [category, setCategory] = useState(initialData?.category ?? 'Antibiotics');
  const [customCategory, setCustomCategory] = useState('');
  const [stock, setStock] = useState(initialData?.stock ?? 50);
  const [minThreshold, setMinThreshold] = useState(initialData?.minThreshold ?? 10);
  const [unitPrice, setUnitPrice] = useState(initialData?.unitPrice ?? 15);
  const [gstRate, setGstRate] = useState(initialData?.gstRate ?? 12);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = category === 'Other' ? customCategory : category;
    await onSave({
      name,
      category: finalCategory || 'General',
      stock: Number(stock),
      minThreshold: Number(minThreshold),
      unitPrice: Number(unitPrice),
      gstRate: Number(gstRate),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">
            {initialData ? 'Edit Medicine' : 'Add New Medicine'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Medicine Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Amoxicillin 500mg"
              className="w-full px-3 py-2 mt-1 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 mt-1 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {COMMON_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="Other">Other / Custom</option>
              </select>
            </div>

            {category === 'Other' && (
              <div>
                <label className="block text-sm font-medium text-slate-700">Custom Category</label>
                <input
                  type="text"
                  required
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="e.g. Dermatology"
                  className="w-full px-3 py-2 mt-1 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Initial Stock (Units)</label>
              <input
                type="number"
                min={0}
                required
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full px-3 py-2 mt-1 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Min Threshold (Alert)
              </label>
              <input
                type="number"
                min={0}
                required
                value={minThreshold}
                onChange={(e) => setMinThreshold(Number(e.target.value))}
                className="w-full px-3 py-2 mt-1 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Unit Price (₹)</label>
              <input
                type="number"
                min={0}
                step="0.01"
                required
                value={unitPrice}
                onChange={(e) => setUnitPrice(Number(e.target.value))}
                className="w-full px-3 py-2 mt-1 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">GST Slab</label>
              <select
                value={gstRate}
                onChange={(e) => setGstRate(Number(e.target.value))}
                className="w-full px-3 py-2 mt-1 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value={0}>0% (Exempt)</option>
                <option value={5}>5%</option>
                <option value={12}>12%</option>
                <option value={18}>18%</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg text-slate-600 bg-slate-100 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : initialData ? 'Update Medicine' : 'Add Medicine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
