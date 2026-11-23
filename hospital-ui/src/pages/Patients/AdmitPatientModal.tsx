import { useState } from 'react';
import { X, BedDouble, AlertCircle } from 'lucide-react';
import type { Patient } from '../../types/patient';
import type { Bed } from '../../types/ward';

interface AdmitPatientModalProps {
  patient: Patient;
  availableBeds: Bed[];
  isSubmitting: boolean;
  onClose: () => void;
  onAssign: (patientId: string, bedId: string) => Promise<any>;
}

export default function AdmitPatientModal({
  patient,
  availableBeds,
  isSubmitting,
  onClose,
  onAssign,
}: AdmitPatientModalProps) {
  const [selectedBedId, setSelectedBedId] = useState<string>(
    availableBeds[0]?.id ? String(availableBeds[0].id) : ''
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const effectiveBedId =
    selectedBedId || (availableBeds[0]?.id ? String(availableBeds[0].id) : '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!effectiveBedId) {
      setErrorMessage('Please select an available bed to admit this patient.');
      return;
    }
    try {
      await onAssign(patient.id, effectiveBedId);
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to assign bed to patient');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Assign Bed &amp; Admit Patient</h3>
            <p className="text-xs text-slate-500">
              {patient.name} ({patient.age}y / {patient.gender}) — {patient.phone}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="flex items-start gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Select Available Bed
            </label>
            {availableBeds.length === 0 ? (
              <div className="p-3 mt-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg">
                No beds are currently available in any ward. Free up an occupied bed or add new beds
                first.
              </div>
            ) : (
              <select
                value={effectiveBedId}
                onChange={(e) => setSelectedBedId(e.target.value)}
                required
                className="w-full px-3 py-2 mt-1.5 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {availableBeds.map((bed) => (
                  <option key={bed.id} value={String(bed.id)}>
                    Bed {bed.bedNumber} — {bed.ward} ({bed.bedType}) • ₹{bed.dailyRate}/day
                  </option>
                ))}
              </select>
            )}
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
              disabled={isSubmitting || availableBeds.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-50 shadow-xs"
            >
              <BedDouble className="w-4 h-4" />
              {isSubmitting ? 'Admitting...' : 'Admit & Assign Bed'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
