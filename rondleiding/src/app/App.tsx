import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { Toaster } from 'sonner';
import { Navigation } from '../components/Navigation';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { AuthProvider } from '../context/AuthContext';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminLayout } from '../pages/admin/AdminLayout';
import { AdminLogin } from '../pages/admin/AdminLogin';
import { BuildingsAdmin } from '../pages/admin/BuildingsAdmin';
import { LocationsAdmin } from '../pages/admin/LocationsAdmin';
import { RoutesAdmin } from '../pages/admin/RoutesAdmin';
import { Home } from '../pages/public/Home';
import { LocationsPage } from '../pages/public/Locations';
import { RouteDetail } from '../pages/public/RouteDetail';
import { RoutesPage } from '../pages/public/Routes';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-background text-foreground">
          <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/routes/:routeId" element={<RouteDetail />} />
            <Route path="/locations" element={<LocationsPage />} />

            <Route path="/admin/login" element={<AdminLogin />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="buildings" element={<BuildingsAdmin />} />
                <Route path="locations" element={<LocationsAdmin />} />
                <Route path="routes" element={<RoutesAdmin />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster richColors position="top-right" />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
