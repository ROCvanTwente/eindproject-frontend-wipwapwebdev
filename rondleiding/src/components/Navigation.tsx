import { Link, NavLink } from 'react-router';
import { MapPinned } from 'lucide-react';
import { Button } from '../app/components/ui/button';

const navClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`;

export function Navigation() {
  return (
    <header className="border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
          <MapPinned className="size-5" />
          Schoolgids
        </Link>
        <nav className="flex items-center gap-4">
          <NavLink to="/" className={navClass} end>
            Home
          </NavLink>
          <NavLink to="/routes" className={navClass}>
            Routes
          </NavLink>
          <NavLink to="/locations" className={navClass}>
            Locaties
          </NavLink>
          <Button asChild size="sm" variant="outline">
            <Link to="/admin/login">Admin</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
