import { useState } from 'react';
import { AlertTriangle, Search, Plus, Minus, Pencil, Trash2 } from 'lucide-react';
import { useMedicines } from '../../hooks/useMedicines';
import type { Medicine, MedicinePayload } from '../../types/pharmacy';
import MedicineFormModal from './MedicineFormModal';

export default function MedicineInventory() {
  const {
    medicines,
    loading,
    error,
    isSubmitting,
    addMedicine,
    editMedicine,
    removeMedicine,
    adjustStock,
  } = useMedicines();

  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);

  const lowStockCount = medicines.filter((m) => m.stock <= m.minThreshold).length;

  const filteredMedicines = medicines.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase());
    const matchesStock = !lowStockOnly || m.stock <= m.minThreshold;
    return matchesSearch && matchesStock;
  });

  const handleOpenAdd = () => {
    setEditingMedicine(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (med: Medicine) => {
    setEditingMedicine(med);
    setIsModalOpen(true);
  };

  const handleSaveMedicine = async (payload: MedicinePayload) => {
    if (editingMedicine) {
      await editMedicine(editingMedicine.id, payload);
    } else {
      await addMedicine(payload);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete ${name} from pharmacy inventory?`)) return;
    try {
      await removeMedicine(id);
    } catch {
      alert('Failed to delete medicine.');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Pharmacy Inventory</h2>
          <p className="text-sm text-slate-500">Track medication stock levels, GST slabs, and restock alerts</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg bg-sky-600 hover:bg-sky-700"
        >
          <Plus className="w-4 h-4" />
          Add Medicine
        </button>
      </div>

      {/* Low Stock Alert Banner */}
      {lowStockCount > 0 && (
        <div className="flex items-center justify-between gap-3 p-4 border rounded-xl bg-amber-50 border-amber-200">
          <div className="flex items-center gap-3 text-amber-800">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">
              {lowStockCount} medication{lowStockCount > 1 ? 's are' : ' is'} at or below minimum threshold.
            </span>
          </div>
          <button
            onClick={() => setLowStockOnly((prev) => !prev)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700"
          >
            {lowStockOnly ? 'Show All' : 'View Low Stock'}
          </button>
        </div>
      )}

      {/* Search Bar & Counter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search medicine or category..."
            className="w-full py-2 pr-4 text-sm bg-white border rounded-lg pl-9 border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <span className="text-xs font-semibold text-slate-500">
          Showing {filteredMedicines.length} of {medicines.length} medicines
        </span>
      </div>

      {/* Table */}
      <div className="overflow-hidden bg-white border rounded-xl border-slate-200">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading inventory...</div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-600">{error}</div>
        ) : filteredMedicines.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">No medicines found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase border-b bg-slate-50 text-slate-500 border-slate-200">
                <tr>
                  <th className="px-6 py-3">Medicine</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Unit Price</th>
                  <th className="px-6 py-3">GST Slab</th>
                  <th className="px-6 py-3">Stock Level</th>
                  <th className="px-6 py-3">Min Alert</th>
                  <th className="px-6 py-3 text-center">Quick Adjust</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMedicines.map((med) => {
                  const isLow = med.stock <= med.minThreshold;
                  return (
                    <tr key={med.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-semibold text-slate-800">{med.name}</td>
                      <td className="px-6 py-4 text-slate-600">
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700">
                          {med.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">₹{med.unitPrice.toFixed(2)}</td>
                      <td className="px-6 py-4 text-slate-600">{med.gstRate}%</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-full ${
                            isLow
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {med.stock} units {isLow && '⚠️'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs font-medium">
                        &le; {med.minThreshold}
                      </td>
                      <td className="px-6 py-4 text-center space-x-1.5">
                        <button
                          onClick={() => adjustStock(med, -1)}
                          disabled={med.stock <= 0}
                          className="p-1 text-slate-600 bg-slate-100 rounded hover:bg-slate-200 disabled:opacity-30"
                          title="Dispense 1"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => adjustStock(med, 10)}
                          className="inline-flex items-center gap-0.5 px-2 py-1 text-xs font-semibold text-sky-700 bg-sky-100 rounded hover:bg-sky-200"
                          title="Restock 10"
                        >
                          <Plus className="w-3 h-3" /> 10
                        </button>
                        <button
                          onClick={() => adjustStock(med, 50)}
                          className="inline-flex items-center gap-0.5 px-2 py-1 text-xs font-semibold text-emerald-700 bg-emerald-100 rounded hover:bg-emerald-200"
                          title="Restock 50"
                        >
                          <Plus className="w-3 h-3" /> 50
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(med)}
                          className="p-1.5 text-slate-500 hover:text-sky-600 rounded"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(med.id, med.name)}
                          className="p-1.5 text-slate-500 hover:text-red-600 rounded"
                          title="Delete"
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

      {/* Add / Edit Medicine Modal */}
      {isModalOpen && (
        <MedicineFormModal
          key={editingMedicine?.id ?? 'new'}
          initialData={editingMedicine}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveMedicine}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
