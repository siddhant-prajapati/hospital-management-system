import { useState } from 'react';
import { Plus, Search, Pencil, Trash2, BedDouble, LogOut } from 'lucide-react';
import PatientFormModal from './PatientFormModal';
import AdmitPatientModal from './AdmitPatientModal';
import { usePatients } from '../../hooks/usePatients';
import { useBeds } from '../../hooks/useBeds';
import type { Patient, PatientPayload, PatientStatus } from '../../types/patient';

const statusStyles: Record<PatientStatus, string> = {
  Active: 'bg-sky-100 text-sky-700',
  Admitted: 'bg-amber-100 text-amber-700',
  Discharged: 'bg-emerald-100 text-emerald-700',
};

export default function PatientList() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [admittingPatient, setAdmittingPatient] = useState<Patient | null>(null);

  const {
    patients,
    loading,
    error,
    isSubmitting,
    addPatient,
    editPatient,
    removePatient,
    assignBed,
    dischargePatient,
  } = usePatients();

  const { beds, refetchBeds } = useBeds();

  const availableBeds = beds.filter((b) => b.status === 'AVAILABLE');

  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search);
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openAddModal = () => {
    setEditingPatient(null);
    setIsModalOpen(true);
  };

  const openEditModal = (patient: Patient) => {
    setEditingPatient(patient);
    setIsModalOpen(true);
  };

  const handleSave = async (formData: PatientPayload) => {
    try {
      if (editingPatient) {
        await editPatient(editingPatient.id, formData);
      } else {
        await addPatient(formData);
      }
      setIsModalOpen(false);
    } catch {
      alert('Failed to save patient. Please try again.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete record for patient ${name}?`)) return;
    try {
      await removePatient(id);
      await refetchBeds();
    } catch {
      alert('Failed to delete patient.');
    }
  };

  const handleAssignBed = async (patientId: string, bedId: string) => {
    await assignBed(patientId, bedId);
    await refetchBeds();
  };

  const handleDischarge = async (patient: Patient) => {
    if (!window.confirm(`Discharge patient "${patient.name}" and free assigned bed?`)) return;
    try {
      await dischargePatient(patient.id);
      await refetchBeds();
    } catch (err: any) {
      alert(err.message || 'Failed to discharge patient');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Patients Directory</h2>
          <p className="text-sm text-slate-500">
            Electronic Health Records (EHR) — Inpatient Admissions &amp; Outpatient Management
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Register Patient
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 p-4 bg-white border rounded-xl border-slate-200 sm:flex-row shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patient name or phone number..."
            className="w-full py-2 pr-4 text-sm border rounded-lg pl-9 border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="ALL">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Admitted">Admitted (Inpatient)</option>
          <option value="Discharged">Discharged</option>
        </select>
      </div>

      {/* Table Area */}
      <div className="overflow-hidden bg-white border rounded-xl border-slate-200 shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading patients...</div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-600">{error}</div>
        ) : filteredPatients.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No matching patient records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Patient Name</th>
                  <th className="px-6 py-3">Age / Gender</th>
                  <th className="px-6 py-3">Contact</th>
                  <th className="px-6 py-3">Visit Type</th>
                  <th className="px-6 py-3">Assigned Bed</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map((patient) => {
                  const isAdmitted = patient.status === 'Admitted' || Boolean(patient.assignedBedNumber);

                  return (
                    <tr key={patient.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        <div>{patient.name}</div>
                        <div className="text-xs font-normal text-slate-400">ID: {patient.id}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {patient.age} yrs / {patient.gender}
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-mono text-xs">{patient.phone}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-md ${
                            patient.type === 'IPD'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {patient.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {patient.assignedBedNumber ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-sky-50 text-sky-700 border border-sky-200">
                            <BedDouble className="w-3.5 h-3.5" />
                            Bed {patient.assignedBedNumber}
                            {patient.assignedWardName && (
                              <span className="text-slate-400">({patient.assignedWardName})</span>
                            )}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No bed assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                            statusStyles[patient.status] || 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {patient.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-1.5">
                        {/* Assign Bed button if not admitted */}
                        {!isAdmitted && (
                          <button
                            onClick={() => setAdmittingPatient(patient)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg text-sky-700 bg-sky-50 hover:bg-sky-100"
                            title="Assign Bed & Admit"
                          >
                            <BedDouble className="w-3.5 h-3.5" />
                            Assign Bed
                          </button>
                        )}

                        {/* Discharge button if currently admitted */}
                        {isAdmitted && (
                          <button
                            onClick={() => handleDischarge(patient)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                            title="Discharge Patient"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            Discharge
                          </button>
                        )}

                        <button
                          onClick={() => openEditModal(patient)}
                          className="p-1.5 text-slate-500 hover:text-sky-600 rounded"
                          title="Edit Record"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(patient.id, patient.name)}
                          className="p-1.5 text-slate-500 hover:text-red-600 rounded"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && (
        <PatientFormModal
          key={editingPatient?.id ?? 'new'}
          initialData={editingPatient}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Admit & Assign Bed Modal */}
      {admittingPatient && (
        <AdmitPatientModal
          key={admittingPatient.id}
          patient={admittingPatient}
          availableBeds={availableBeds}
          isSubmitting={isSubmitting}
          onClose={() => setAdmittingPatient(null)}
          onAssign={handleAssignBed}
        />
      )}
    </div>
  );
}
