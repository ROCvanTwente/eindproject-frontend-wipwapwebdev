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
    <aside className="w-full border-r border-border/70 bg-white md:w-72">
      <div className="border-b border-border/70 px-4 py-5">
        <p className="roc-kicker text-muted-foreground">beheer</p>
        <h2 className="roc-title mt-1 text-xl">dashboard</h2>
      </div>
      <nav className="space-y-1 p-3">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-[2mm] px-3 py-3 text-sm font-semibold uppercase tracking-[0.08em] ${
                isActive ? 'bg-primary text-white shadow-[0_10px_24px_rgba(0,72,152,0.18)]' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`
            }
          >
            <Icon className="size-4" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-3">
        <Button type="button" variant="outline" className="w-full justify-start uppercase tracking-[0.08em]" onClick={logout}>
          <LogOut className="mr-2 size-4" />
          uitloggen
        </Button>
      </div>
    </aside>
  );
}
