import { Link, NavLink } from 'react-router';
import { MapPinned } from 'lucide-react';
import { Button } from '../app/components/ui/button';

const navClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-semibold uppercase tracking-[0.14em] transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`;

export function Navigation() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-white/90 backdrop-blur-md">
      <div className="roc-content-wrap flex items-center justify-between gap-4 py-4">
        <Link to="/">
          <img src="src\img\rvt-logo_cmyk.png" alt="ROC van Twente" className="h-16 w-auto" />
        </Link>
        <nav className="flex items-center gap-4 md:gap-6">
          <NavLink to="/" className={navClass} end>
            home
          </NavLink>
          <NavLink to="/routes" className={navClass}>
            routes
          </NavLink>
          <NavLink to="/locations" className={navClass}>
            locaties
          </NavLink>
          <Button asChild size="sm" variant="outline" className="hidden md:inline-flex">
            <Link to="/admin/login">Admin</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
