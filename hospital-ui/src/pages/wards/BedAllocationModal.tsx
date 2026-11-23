import { useState } from 'react';
import { X, UserCheck, Wrench, LogOut, Trash2, AlertCircle } from 'lucide-react';
import type { Bed, BedStatus } from '../../types/ward';
import type { Patient } from '../../types/patient';

interface BedAllocationModalProps {
  bed: Bed;
  availablePatients: Patient[];
  isUpdating: boolean;
  onClose: () => void;
  onAssign: (bedId: string, patient: Patient) => Promise<void>;
  onRelease: (bedId: string, nextStatus: Exclude<BedStatus, 'OCCUPIED'>) => Promise<void>;
  onDelete?: (bedId: string) => Promise<void>;
}

export default function BedAllocationModal({
  bed,
  availablePatients,
  isUpdating,
  onClose,
  onAssign,
  onRelease,
  onDelete,
}: BedAllocationModalProps) {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    availablePatients[0]?.id ? String(availablePatients[0].id) : ''
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Compute active target patient ID
  const effectivePatientId =
    selectedPatientId || (availablePatients[0]?.id ? String(availablePatients[0].id) : '');

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const patient = availablePatients.find(
      (p) => String(p.id) === effectivePatientId
    );

    if (!patient) {
      setErrorMessage('Please select a valid registered patient to assign to this bed.');
      return;
    }

    try {
      await onAssign(bed.id, patient);
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to assign bed to patient');
    }
  };

  const handleStatusChange = async (nextStatus: Exclude<BedStatus, 'OCCUPIED'>) => {
    setErrorMessage(null);
    try {
      await onRelease(bed.id, nextStatus);
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to update bed status');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete bed ${bed.bedNumber}? This cannot be undone.`)) return;
    if (onDelete) {
      await onDelete(bed.id);
      onClose();
    }
  };

  const statusLabel: Record<string, string> = {
    AVAILABLE: 'Available',
    OCCUPIED: 'Occupied',
    UNDER_MAINTENANCE: 'Maintenance',
    RESERVED: 'Reserved',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Bed {bed.bedNumber}
            </h3>
            <p className="text-xs text-slate-500">
              {bed.ward} • {bed.bedType} • Currently {statusLabel[bed.status] ?? bed.status}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Error Banner if any */}
          {errorMessage && (
            <div className="flex items-start gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Bed Meta Details */}
          <div className="grid grid-cols-2 gap-3 p-3 text-xs border rounded-lg bg-slate-50 border-slate-200 text-slate-600">
            <div>
              <span className="font-medium text-slate-400 uppercase">Type:</span>{' '}
              <span className="font-semibold text-slate-700">{bed.bedType}</span>
            </div>
            <div>
              <span className="font-medium text-slate-400 uppercase">Rate:</span>{' '}
              <span className="font-semibold text-slate-700">₹{bed.dailyRate} / day</span>
            </div>
            {bed.notes && (
              <div className="col-span-2">
                <span className="font-medium text-slate-400 uppercase">Notes:</span>{' '}
                <span className="text-slate-700">{bed.notes}</span>
              </div>
            )}
          </div>

          {/* OCCUPIED State: Show Assigned Patient + Discharge Button */}
          {bed.status === 'OCCUPIED' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-sky-50 border border-sky-200">
                <p className="text-xs font-semibold uppercase text-sky-600">Admitted Patient</p>
                <p className="mt-1 text-lg font-bold text-slate-800">
                  {bed.patientName}
                </p>
                {bed.patientId && (
                  <p className="text-xs text-slate-500 mt-0.5">Patient ID: {bed.patientId}</p>
                )}
              </div>

              <button
                onClick={() => handleStatusChange('AVAILABLE')}
                disabled={isUpdating}
                className="flex items-center justify-center w-full gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 shadow-xs"
              >
                <LogOut className="w-4 h-4" />
                {isUpdating ? 'Discharging Patient...' : 'Discharge & Free Bed'}
              </button>
            </div>
          )}

          {/* AVAILABLE State: Assign Patient Form */}
          {bed.status === 'AVAILABLE' && (
            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Select Patient to Admit
                </label>
                {availablePatients.length === 0 ? (
                  <div className="p-3 mt-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg">
                    No unassigned patients found. Register an unassigned patient in the Patients tab
                    first.
                  </div>
                ) : (
                  <select
                    value={effectivePatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    required
                    className="w-full px-3 py-2 mt-1.5 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {availablePatients.map((p) => (
                      <option key={p.id} value={String(p.id)}>
                        {p.name} ({p.age}y / {p.gender}) — {p.phone} [{p.type}]
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isUpdating || availablePatients.length === 0}
                  className="flex items-center justify-center w-full gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700 disabled:opacity-50 shadow-xs"
                >
                  <UserCheck className="w-4 h-4" />
                  {isUpdating ? 'Assigning Patient to Bed...' : 'Assign Bed to Patient'}
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange('UNDER_MAINTENANCE')}
                  disabled={isUpdating}
                  className="flex items-center justify-center w-full gap-2 px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100"
                >
                  <Wrench className="w-4 h-4" />
                  Mark Under Maintenance
                </button>
                {onDelete && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isUpdating}
                    className="flex items-center justify-center w-full gap-1.5 px-4 py-2 text-xs font-medium text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Bed
                  </button>
                )}
              </div>
            </form>
          )}

          {/* UNDER_MAINTENANCE State */}
          {bed.status === 'UNDER_MAINTENANCE' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                This bed is undergoing sanitization or repairs. Mark it available once ready for
                patient intake.
              </p>
              <button
                onClick={() => handleStatusChange('AVAILABLE')}
                disabled={isUpdating}
                className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 shadow-xs"
              >
                {isUpdating ? 'Updating...' : 'Mark as Ready & Available'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
