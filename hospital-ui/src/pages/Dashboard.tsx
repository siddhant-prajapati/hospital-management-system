import { Users, BedDouble, AlertTriangle, IndianRupee, Building2, Activity } from 'lucide-react';
import { usePatients } from '../hooks/usePatients';
import { useBeds } from '../hooks/useBeds';
import { useWards } from '../hooks/useWards';
import { useMedicines } from '../hooks/useMedicines';
import { useInvoices } from '../hooks/useInvoices';

export default function Dashboard() {
  const { patients, loading: pLoading } = usePatients();
  const { wards, loading: wLoading } = useWards();
  const { beds, loading: bLoading } = useBeds();
  const { medicines, loading: mLoading } = useMedicines();
  const { invoices, loading: iLoading } = useInvoices();

  const totalPatients = patients.length;
  const ipdPatients = patients.filter((p) => p.type === 'IPD').length;
  const opdPatients = patients.filter((p) => p.type === 'OPD').length;

  const totalWards = wards.length;
  const availableBeds = beds.filter((b) => b.status === 'AVAILABLE').length;
  const occupiedBeds = beds.filter((b) => b.status === 'OCCUPIED').length;
  const totalBeds = beds.length;
  const bedOccupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const lowStockMeds = medicines.filter((m) => m.stock <= m.minThreshold).length;

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const pendingRevenue = invoices
    .filter((inv) => inv.status === 'Pending')
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  const stats = [
    {
      label: 'Registered Patients',
      value: pLoading ? '—' : totalPatients.toLocaleString(),
      subtext: `${ipdPatients} Inpatients (IPD) • ${opdPatients} Outpatients (OPD)`,
      icon: Users,
      color: 'text-sky-600 bg-sky-100',
    },
    {
      label: 'Hospital Wards & Units',
      value: wLoading ? '—' : `${totalWards} Wards`,
      subtext: `${beds.length} Total Registered Beds`,
      icon: Building2,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      label: 'Bed Availability',
      value: bLoading ? '—' : `${availableBeds} / ${totalBeds}`,
      subtext: `${occupiedBeds} Occupied (${bedOccupancyRate}% occupancy)`,
      icon: BedDouble,
      color: 'text-emerald-600 bg-emerald-100',
    },
    {
      label: 'Pharmacy Stock Alerts',
      value: mLoading ? '—' : String(lowStockMeds),
      subtext: lowStockMeds > 0 ? 'Requires immediate restock' : 'All medications well stocked',
      icon: AlertTriangle,
      color: lowStockMeds > 0 ? 'text-amber-600 bg-amber-100' : 'text-slate-600 bg-slate-100',
    },
    {
      label: 'Total Billed Revenue',
      value: iLoading ? '—' : `₹${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      subtext: `₹${pendingRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })} Pending Dues`,
      icon: IndianRupee,
      color: 'text-indigo-600 bg-indigo-100',
    },
    {
      label: 'Active Care Ratio',
      value: pLoading || bLoading ? '—' : `${occupiedBeds} admitted`,
      subtext: `${patients.filter((p) => p.status === 'Active').length} active patient cases`,
      icon: Activity,
      color: 'text-teal-600 bg-teal-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Hospital Operational Overview</h2>
        <p className="text-sm text-slate-500">Live operational metrics mapped across backend clinical entities</p>
      </div>

      {/* Grid: 1 col on mobile, 2 on tablet, 3 on desktop */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(({ label, value, subtext, icon: Icon, color }) => (
          <div
            key={label}
            className="flex items-start justify-between p-5 bg-white border rounded-xl border-slate-200 shadow-xs"
          >
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-800">{value}</p>
              <p className="mt-1.5 text-xs font-medium text-slate-500">{subtext}</p>
            </div>
            <div className={`p-3 rounded-xl ${color}`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
