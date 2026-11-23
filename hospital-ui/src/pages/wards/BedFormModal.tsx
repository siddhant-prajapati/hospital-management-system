import { useState } from 'react';
import { X } from 'lucide-react';
import type { BedPayload, BedType, Ward } from '../../types/ward';

const BED_TYPES: BedType[] = ['STANDARD', 'DELUXE', 'ICU', 'VENTILATOR', 'ISOLATION'];

interface BedFormModalProps {
  wards: Ward[];
  initialWardId?: string;
  onClose: () => void;
  onSave: (wardId: string, payload: BedPayload) => Promise<any>;
  isSubmitting: boolean;
}

export default function BedFormModal({
  wards,
  initialWardId,
  onClose,
  onSave,
  isSubmitting,
}: BedFormModalProps) {
  const [wardId, setWardId] = useState(initialWardId || wards[0]?.id || '');
  const [bedNumber, setBedNumber] = useState('');
  const [bedType, setBedType] = useState<BedType>('STANDARD');
  const [dailyRate, setDailyRate] = useState<number>(1000);
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wardId) return;
    await onSave(wardId, {
      bedNumber,
      bedType,
      dailyRate: Number(dailyRate),
      notes: notes || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">Add Bed to Ward</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Assign to Ward</label>
            <select
              value={wardId}
              onChange={(e) => setWardId(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {wards.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.wardName} ({w.wardType}) — Floor {w.floorNumber ?? 'N/A'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Bed Number / Code</label>
            <input
              type="text"
              required
              value={bedNumber}
              onChange={(e) => setBedNumber(e.target.value)}
              placeholder="e.g. ICU-01, B-102"
              className="w-full px-3 py-2 mt-1 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Bed Type</label>
              <select
                value={bedType}
                onChange={(e) => setBedType(e.target.value as BedType)}
                className="w-full px-3 py-2 mt-1 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {BED_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Daily Rate (₹)</label>
              <input
                type="number"
                min={0}
                step="0.01"
                required
                value={dailyRate}
                onChange={(e) => setDailyRate(Number(e.target.value))}
                placeholder="1000"
                className="w-full px-3 py-2 mt-1 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Notes / Amenities (Optional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Oxygen port, adjustable rail, cardiac monitor"
              className="w-full px-3 py-2 mt-1 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
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
              {isSubmitting ? 'Adding...' : 'Add Bed'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
