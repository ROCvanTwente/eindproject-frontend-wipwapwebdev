import { Outlet } from 'react-router';
import { AdminNav } from '../../components/AdminNav';

export function AdminLayout() {
  return (
    <div className="flex min-h-[calc(100vh-57px)] flex-col md:flex-row">
      <AdminNav />
      <main className="flex-1 p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
}
