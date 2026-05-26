import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  const links = [
    { to: "/", label: "home" },
    { to: "/tours", label: "rondleidingen" },
    { to: "/boeken", label: "boeken" },
    { to: "/admin", label: "beheer" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b-2 border-roc-red shadow-sm">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-1 font-canaro text-lg font-bold no-underline hover:no-underline">
          <span className="text-roc-blue">roc</span>
          <span className="text-roc-red px-0.5">van</span>
          <span className="text-roc-blue">twente</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`font-canaro font-bold text-sm uppercase tracking-wide no-underline transition-colors duration-150 ${
                pathname === l.to
                  ? "text-roc-red border-b-2 border-roc-red pb-0.5"
                  : "text-roc-dark hover:text-roc-blue"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <Link to="/boeken" className="hidden md:inline-flex btn-primary text-xs py-2 px-4">
          plan een bezoek
        </Link>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-roc-dark"
          onClick={() => setOpen(!open)}
          aria-label="menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-4">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={`font-canaro font-bold text-sm uppercase tracking-wide no-underline ${
                pathname === l.to ? "text-roc-red" : "text-roc-dark"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link to="/boeken" onClick={() => setOpen(false)} className="btn-primary text-xs w-fit">
            plan een bezoek
          </Link>
        </div>
      )}
    </header>
  );
}
