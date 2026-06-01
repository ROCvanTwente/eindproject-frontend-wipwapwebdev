import { Outlet } from 'react-router';
import { AdminNav } from '../../components/AdminNav';

export function AdminLayout() {
  return (
    <div className="flex min-h-[calc(100vh-73px)] flex-col bg-[linear-gradient(135deg,rgba(0,72,152,0.03),rgba(255,255,255,0))] md:flex-row">
      <AdminNav />
      <main className="flex-1 p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
}
