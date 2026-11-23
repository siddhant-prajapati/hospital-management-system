import { lazy, Suspense } from 'react'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import PageLoader from './components/common/PageLoader';

const PatientList = lazy(() => import('./pages/Patients/PatientList'));
const WardGrid = lazy(() => import('./pages/wards/WardGrid'));
const MedicineInventory = lazy(() => import('./pages/pharmacy/MedicineInventory'));
const InvoiceList = lazy(() => import('./pages/billing/InvoiceList'));

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route
            path="patients"
            element={
              <Suspense fallback={<PageLoader />}>
                <PatientList />
              </Suspense>
            }
          />
          <Route
            path="wards"
            element={
              <Suspense fallback={<PageLoader />}>
                <WardGrid />
              </Suspense>
            }
          />
          <Route
            path="pharmacy"
            element={
              <Suspense fallback={<PageLoader />}>
                <MedicineInventory />
              </Suspense>
            }
          />
          <Route
            path="billing"
            element={
              <Suspense fallback={<PageLoader />}>
                <InvoiceList />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
