import { NavLink } from 'react-router';
import { LayoutDashboard, Building2, MapPin, Route, LogOut } from 'lucide-react';
import { Button } from '../app/components/ui/button';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/buildings', label: 'Gebouwen', icon: Building2 },
  { to: '/admin/locations', label: 'Locaties', icon: MapPin },
  { to: '/admin/routes', label: 'Routes', icon: Route },
];

export function AdminNav() {
  const { logout } = useAuth();

  return (
    <aside className="w-full border-r bg-card md:w-64">
      <div className="border-b px-4 py-4">
        <h2 className="text-lg font-semibold">Admin</h2>
      </div>
      <nav className="space-y-1 p-3">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`
            }
          >
            <Icon className="size-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3">
        <Button type="button" variant="outline" className="w-full justify-start" onClick={logout}>
          <LogOut className="mr-2 size-4" />
          Uitloggen
        </Button>
      </div>
    </aside>
  );
}
