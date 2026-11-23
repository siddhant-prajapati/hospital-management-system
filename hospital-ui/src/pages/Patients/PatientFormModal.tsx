import { useState } from 'react';
import { X } from 'lucide-react';
import type { Gender, Patient, PatientPayload, PatientStatus, VisitType } from '../../types/patient';

interface PatientFormModalProps {
  initialData?: Patient | null;
  onClose: () => void;
  onSave: (payload: PatientPayload) => Promise<any>;
  isSubmitting: boolean;
}

export default function PatientFormModal({
  initialData,
  onClose,
  onSave,
  isSubmitting,
}: PatientFormModalProps) {
  const [form, setForm] = useState({
    name: initialData?.name || '',
    age: initialData?.age ? String(initialData.age) : '',
    gender: (initialData?.gender || 'Male') as Gender,
    phone: initialData?.phone || '',
    type: (initialData?.type || 'OPD') as VisitType,
    status: (initialData?.status || 'Active') as PatientStatus,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: form.name,
      age: Number(form.age),
      gender: form.gender,
      phone: form.phone,
      type: form.type,
      status: form.status,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">
            {initialData ? 'Edit Patient Record' : 'Register New Patient'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Full Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 mt-1 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="e.g. Meera Desai"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Age</label>
              <input
                type="number"
                name="age"
                min="0"
                max="120"
                value={form.age}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 mt-1 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Years"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Gender</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 mt-1 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Phone Number (10 Digits)</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              pattern="[0-9]{10}"
              title="Enter a 10-digit mobile number"
              className="w-full px-3 py-2 mt-1 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="e.g. 9876543210"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Visit Type</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full px-3 py-2 mt-1 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="OPD">OPD (Outpatient)</option>
                <option value="IPD">IPD (Inpatient)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Patient Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-3 py-2 mt-1 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="Active">Active</option>
                <option value="Admitted">Admitted</option>
                <option value="Discharged">Discharged</option>
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
              {isSubmitting ? 'Saving...' : initialData ? 'Update Record' : 'Register Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
