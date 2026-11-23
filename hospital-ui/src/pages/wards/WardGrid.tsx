import { useState } from 'react';
import {
  BedDouble,
  User,
  Wrench,
  Plus,
  Building2,
  Pencil,
  Trash2,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useBeds } from '../../hooks/useBeds';
import { useWards } from '../../hooks/useWards';
import { usePatients } from '../../hooks/usePatients';
import type { Bed, Ward, WardPayload } from '../../types/ward';
import BedAllocationModal from './BedAllocationModal';
import WardFormModal from './WardFormModal';
import BedFormModal from './BedFormModal';

const cardStyles: Record<string, string> = {
  AVAILABLE: 'border-emerald-200 bg-emerald-50/50 hover:border-emerald-400',
  OCCUPIED: 'border-sky-200 bg-sky-50/60 hover:border-sky-400',
  UNDER_MAINTENANCE: 'border-amber-200 bg-amber-50/60 hover:border-amber-400',
  RESERVED: 'border-purple-200 bg-purple-50/60 hover:border-purple-400',
};

const badgeStyles: Record<string, string> = {
  AVAILABLE: 'bg-emerald-100 text-emerald-700',
  OCCUPIED: 'bg-sky-100 text-sky-700',
  UNDER_MAINTENANCE: 'bg-amber-100 text-amber-700',
  RESERVED: 'bg-purple-100 text-purple-700',
};

const bedTypeBadges: Record<string, string> = {
  STANDARD: 'bg-slate-100 text-slate-700',
  DELUXE: 'bg-indigo-100 text-indigo-700',
  ICU: 'bg-rose-100 text-rose-700',
  VENTILATOR: 'bg-purple-100 text-purple-700',
  ISOLATION: 'bg-orange-100 text-orange-700',
};

export default function WardGrid() {
  const {
    wards,
    loading: wardsLoading,
    addWard,
    editWard,
    removeWard,
    isSubmitting: wardSubmitting,
  } = useWards();

  const {
    beds,
    loading: bedsLoading,
    error: bedsError,
    isUpdating,
    addBed,
    removeBed,
    assignPatientToBed,
    releaseBed,
  } = useBeds();

  const { patients, refetchPatients } = usePatients();

  const [selectedWardId, setSelectedWardId] = useState<string>('ALL');
  const [activeBed, setActiveBed] = useState<Bed | null>(null);
  const [isWardModalOpen, setIsWardModalOpen] = useState(false);
  const [editingWard, setEditingWard] = useState<Ward | null>(null);
  const [isBedModalOpen, setIsBedModalOpen] = useState(false);
  const [targetWardIdForBed, setTargetWardIdForBed] = useState<string | undefined>(undefined);

  // Selected ward object if filtering by specific ward
  const currentWard = wards.find((w) => w.id === selectedWardId);

  // Filtered beds
  const filteredBeds =
    selectedWardId === 'ALL'
      ? beds
      : beds.filter((b) => b.wardId === selectedWardId || b.ward === currentWard?.wardName);

  const occupiedPatientIds = new Set(
    beds.map((b) => b.patientId).filter((id): id is string => id !== null)
  );

  const unassignedPatients = patients.filter((p) => !occupiedPatientIds.has(String(p.id)));

  const availableCount = beds.filter((b) => b.status === 'AVAILABLE').length;
  const occupiedCount = beds.filter((b) => b.status === 'OCCUPIED').length;
  const totalCapacity = wards.reduce((sum, w) => sum + (w.totalCapacity ?? 0), 0) || beds.length;

  const handleOpenAddWard = () => {
    setEditingWard(null);
    setIsWardModalOpen(true);
  };

  const handleOpenEditWard = (ward: Ward, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingWard(ward);
    setIsWardModalOpen(true);
  };

  const handleDeleteWard = async (wardId: string, wardName: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!window.confirm(`Deactivate ward "${wardName}"?`)) return;
    try {
      await removeWard(wardId);
      if (selectedWardId === wardId) {
        setSelectedWardId('ALL');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to deactivate ward');
    }
  };

  const handleSaveWard = async (payload: WardPayload) => {
    if (editingWard) {
      await editWard(editingWard.id, payload);
    } else {
      await addWard(payload);
    }
    setEditingWard(null);
  };

  const handleOpenAddBed = (wardId?: string) => {
    setTargetWardIdForBed(wardId || (selectedWardId !== 'ALL' ? selectedWardId : undefined));
    setIsBedModalOpen(true);
  };

  const handleAddBedSave = async (targetWardId: string, payload: any) => {
    await addBed(targetWardId, payload);
  };

  const handleAssignPatientToBed = async (bedId: string, patient: any) => {
    await assignPatientToBed(bedId, patient);
    await refetchPatients();
  };

  const handleReleaseBed = async (bedId: string, nextStatus: any) => {
    await releaseBed(bedId, nextStatus);
    await refetchPatients();
  };

  return (
    <div className="space-y-6">
      {/* Header + Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Wards &amp; Bed Allocation</h2>
          <p className="text-sm text-slate-500">
            Real-time inpatient ADT (Admission, Transfer &amp; Discharge) management
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleOpenAddWard}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs"
          >
            <Building2 className="w-4 h-4 text-sky-600" />
            + New Ward
          </button>
          <button
            onClick={() => handleOpenAddBed()}
            disabled={wards.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 shadow-xs disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Add Bed
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="p-4 bg-white border rounded-xl border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase">Configured Wards</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">
            {wardsLoading ? '...' : wards.length}
          </p>
        </div>
        <div className="p-4 bg-white border rounded-xl border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase">Total Capacity</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{totalCapacity} beds</p>
        </div>
        <div className="p-4 bg-white border rounded-xl border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-emerald-600 uppercase">Available Beds</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{availableCount}</p>
        </div>
        <div className="p-4 bg-white border rounded-xl border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-sky-600 uppercase">Occupied Beds</p>
          <p className="mt-1 text-2xl font-bold text-sky-700">{occupiedCount}</p>
        </div>
      </div>

      {/* Ward Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSelectedWardId('ALL')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            selectedWardId === 'ALL'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          All Wards ({wards.length})
        </button>
        {wards.map((ward) => {
          const wardBeds = beds.filter(
            (b) => b.wardId === ward.id || b.ward === ward.wardName
          );
          return (
            <button
              key={ward.id}
              onClick={() => setSelectedWardId(ward.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                selectedWardId === ward.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {ward.wardName} ({wardBeds.length} beds)
            </button>
          );
        })}
      </div>

      {/* ── SECTION 1: WARDS OVERVIEW CARDS (Visible on "All Wards") ── */}
      {selectedWardId === 'ALL' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-sky-600" />
              Hospital Wards ({wards.length})
            </h3>
            <span className="text-xs text-slate-400">
              Click a ward tab above or a card below to manage its beds
            </span>
          </div>

          {wardsLoading ? (
            <div className="p-6 text-center text-sm text-slate-500 bg-white border rounded-xl border-slate-200">
              Loading wards...
            </div>
          ) : wards.length === 0 ? (
            <div className="p-8 text-center bg-white border rounded-xl border-slate-200">
              <Building2 className="w-10 h-10 mx-auto text-slate-300" />
              <p className="mt-2 text-base font-semibold text-slate-700">No wards created yet</p>
              <p className="text-sm text-slate-500 mt-1">
                Start by creating your first hospital ward (e.g. ICU, General, Maternity).
              </p>
              <button
                onClick={handleOpenAddWard}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700"
              >
                <Plus className="w-4 h-4" />
                Create First Ward
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {wards.map((ward) => {
                const wardBeds = beds.filter(
                  (b) => b.wardId === ward.id || b.ward === ward.wardName
                );
                const wardOccupied = wardBeds.filter((b) => b.status === 'OCCUPIED').length;
                const wardAvailable = wardBeds.filter((b) => b.status === 'AVAILABLE').length;
                const percentConfigured =
                  ward.totalCapacity > 0
                    ? Math.min(100, Math.round((wardBeds.length / ward.totalCapacity) * 100))
                    : 0;

                return (
                  <div
                    key={ward.id}
                    className="p-5 bg-white border rounded-xl border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
                  >
                    <div>
                      {/* Ward Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 text-lg">
                              {ward.wardName}
                            </span>
                            <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-sky-50 text-sky-700 border border-sky-200">
                              {ward.wardType}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Floor {ward.floorNumber ?? '1'} • {ward.wing || 'Main Wing'}
                          </p>
                        </div>

                        {/* Ward Card Actions */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => handleOpenEditWard(ward, e)}
                            className="p-1 text-slate-400 hover:text-sky-600 rounded"
                            title="Edit Ward Details"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteWard(ward.id, ward.wardName, e)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded"
                            title="Deactivate Ward"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Capacity & Occupancy Meter */}
                      <div className="mt-4 space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold text-slate-600">
                          <span>
                            Beds Configured: {wardBeds.length} / {ward.totalCapacity}
                          </span>
                          <span className="text-slate-400">{percentConfigured}% capacity</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              percentConfigured >= 100 ? 'bg-amber-500' : 'bg-sky-500'
                            }`}
                            style={{ width: `${percentConfigured}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                          <span className="text-emerald-600 font-medium">
                            {wardAvailable} Available
                          </span>
                          <span className="text-sky-600 font-medium">{wardOccupied} Occupied</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => setSelectedWardId(ward.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-sky-600"
                      >
                        View Beds
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenAddBed(ward.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-md"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Bed
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── SECTION 2: SPECIFIC WARD BANNER (Visible when a ward is selected) ── */}
      {selectedWardId !== 'ALL' && currentWard && (
        <div className="p-5 bg-white border rounded-xl border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-800">{currentWard.wardName}</h3>
              <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-sky-100 text-sky-700">
                {currentWard.wardType}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Floor {currentWard.floorNumber ?? '1'} • {currentWard.wing || 'Main Wing'} • Maximum
              Capacity: {currentWard.totalCapacity} beds
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => handleOpenEditWard(currentWard, e)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit Ward
            </button>
            <button
              onClick={() => handleOpenAddBed(currentWard.id)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Bed to {currentWard.wardName}
            </button>
          </div>
        </div>
      )}

      {/* ── SECTION 3: BEDS GRID ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-600" />
            {selectedWardId === 'ALL'
              ? `All Hospital Beds (${filteredBeds.length})`
              : `Beds in ${currentWard?.wardName ?? 'Ward'} (${filteredBeds.length})`}
          </h3>
          {filteredBeds.length > 0 && (
            <span className="text-xs text-slate-400">Click any bed to assign or discharge</span>
          )}
        </div>

        {bedsLoading ? (
          <div className="p-8 text-center text-sm bg-white border rounded-xl border-slate-200 text-slate-500">
            Loading ward beds...
          </div>
        ) : bedsError ? (
          <div className="p-8 text-center text-sm text-red-600 bg-white border rounded-xl border-slate-200">
            {bedsError}
          </div>
        ) : filteredBeds.length === 0 ? (
          <div className="p-10 text-center bg-white border rounded-xl border-slate-200 shadow-xs">
            <BedDouble className="w-10 h-10 mx-auto text-slate-300" />
            <p className="mt-2 text-base font-semibold text-slate-700">
              {selectedWardId === 'ALL'
                ? 'No beds configured in the hospital yet'
                : `No beds added to ${currentWard?.wardName ?? 'this ward'} yet`}
            </p>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              {wards.length > 0
                ? 'Your wards are configured! Click the "Add Bed" button below to add bed slots (e.g. ICU-01, BED-101) to your ward.'
                : 'Start by creating your first ward above, then add beds to it.'}
            </p>
            {wards.length > 0 && (
              <button
                onClick={() =>
                  handleOpenAddBed(selectedWardId !== 'ALL' ? selectedWardId : undefined)
                }
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Add Bed Now
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredBeds.map((bed) => (
              <button
                key={bed.id}
                onClick={() => setActiveBed(bed)}
                className={`p-5 text-left transition-all border-2 rounded-xl shadow-xs ${
                  cardStyles[bed.status] ?? cardStyles['AVAILABLE']
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-lg font-bold text-slate-800">{bed.bedNumber}</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                          bedTypeBadges[bed.bedType] ?? 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {bed.bedType}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        ₹{bed.dailyRate}/day
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                      badgeStyles[bed.status] ?? badgeStyles['AVAILABLE']
                    }`}
                  >
                    {bed.status}
                  </span>
                </div>

                <p className="mt-3 text-xs font-medium text-slate-500">
                  {bed.ward || 'General Ward'}
                </p>

                <div className="flex items-center gap-2 pt-3 mt-3 text-sm border-t border-slate-200/70">
                  {bed.status === 'OCCUPIED' ? (
                    <>
                      <User className="w-4 h-4 text-sky-600 shrink-0" />
                      <span className="font-semibold text-slate-800 truncate">
                        {bed.patientName}
                      </span>
                    </>
                  ) : bed.status === 'UNDER_MAINTENANCE' ? (
                    <>
                      <Wrench className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="text-amber-700 font-medium">Under Maintenance</span>
                    </>
                  ) : (
                    <>
                      <BedDouble className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-emerald-700 font-medium">Ready for Intake</span>
                    </>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bed Allocation & Management Modal */}
      {activeBed && (
        <BedAllocationModal
          key={activeBed.id}
          bed={activeBed}
          availablePatients={unassignedPatients}
          isUpdating={isUpdating}
          onClose={() => setActiveBed(null)}
          onAssign={handleAssignPatientToBed}
          onRelease={handleReleaseBed}
          onDelete={removeBed}
        />
      )}

      {/* Ward Creation / Edit Modal */}
      {isWardModalOpen && (
        <WardFormModal
          key={editingWard?.id ?? 'new-ward'}
          initialData={editingWard}
          onClose={() => {
            setIsWardModalOpen(false);
            setEditingWard(null);
          }}
          onSave={handleSaveWard}
          isSubmitting={wardSubmitting}
        />
      )}

      {/* Bed Creation Modal */}
      {isBedModalOpen && (
        <BedFormModal
          wards={wards}
          initialWardId={targetWardIdForBed}
          onClose={() => {
            setIsBedModalOpen(false);
            setTargetWardIdForBed(undefined);
          }}
          onSave={handleAddBedSave}
          isSubmitting={isUpdating}
        />
      )}
    </div>
  );
}
