import { useState } from 'react';
import { X } from 'lucide-react';
import type { Ward, WardPayload, WardType } from '../../types/ward';

const WARD_TYPES: WardType[] = [
  'GENERAL',
  'ICU',
  'MATERNITY',
  'PAEDIATRIC',
  'SURGICAL',
  'PSYCHIATRIC',
  'EMERGENCY',
  'ISOLATION',
  'ONCOLOGY',
  'CARDIAC',
];

interface WardFormModalProps {
  initialData?: Ward | null;
  onClose: () => void;
  onSave: (payload: WardPayload) => Promise<any>;
  isSubmitting: boolean;
}

export default function WardFormModal({
  initialData,
  onClose,
  onSave,
  isSubmitting,
}: WardFormModalProps) {
  const [wardName, setWardName] = useState(initialData?.wardName ?? '');
  const [wardType, setWardType] = useState<WardType>(initialData?.wardType ?? 'GENERAL');
  const [totalCapacity, setTotalCapacity] = useState(initialData?.totalCapacity ?? 10);
  const [floorNumber, setFloorNumber] = useState<number | ''>(initialData?.floorNumber ?? 1);
  const [wing, setWing] = useState(initialData?.wing ?? 'East Wing');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      wardName,
      wardType,
      totalCapacity: Number(totalCapacity),
      floorNumber: floorNumber === '' ? null : Number(floorNumber),
      wing: wing || null,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">
            {initialData ? 'Edit Ward' : 'Create New Ward'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Ward Name</label>
            <input
              type="text"
              required
              value={wardName}
              onChange={(e) => setWardName(e.target.value)}
              placeholder="e.g. Intensive Care Unit - A"
              className="w-full px-3 py-2 mt-1 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Ward Type</label>
              <select
                value={wardType}
                onChange={(e) => setWardType(e.target.value as WardType)}
                className="w-full px-3 py-2 mt-1 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {WARD_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Total Capacity</label>
              <input
                type="number"
                min={1}
                max={500}
                required
                value={totalCapacity}
                onChange={(e) => setTotalCapacity(Number(e.target.value))}
                className="w-full px-3 py-2 mt-1 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Floor Number</label>
              <input
                type="number"
                value={floorNumber}
                onChange={(e) => setFloorNumber(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 2"
                className="w-full px-3 py-2 mt-1 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Wing / Block</label>
              <input
                type="text"
                value={wing}
                onChange={(e) => setWing(e.target.value)}
                placeholder="e.g. North Wing"
                className="w-full px-3 py-2 mt-1 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
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
              {isSubmitting ? 'Saving...' : initialData ? 'Update Ward' : 'Create Ward'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
