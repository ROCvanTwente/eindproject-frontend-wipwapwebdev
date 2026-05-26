import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, Users, MapPin, Search } from "lucide-react";
import { toursApi } from "../services/api";
import type { Tour } from "../types";

export function ToursPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [filtered, setFiltered] = useState<Tour[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    toursApi
      .getAll(true)
      .then((data) => { setTours(data); setFiltered(data); })
      .catch(() => setError("rondleidingen konden niet worden geladen."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = query.toLowerCase();
    setFiltered(
      q
        ? tours.filter(
            (t) =>
              t.title.toLowerCase().includes(q) ||
              t.description.toLowerCase().includes(q)
          )
        : tours
    );
  }, [query, tours]);

  return (
    <main className="pt-16">
      {/* Page header */}
      <section className="bg-roc-blue text-white py-14 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(67deg, #0064AD 60%, #004f8a 60%)" }}
        />
        <div className="relative max-w-6xl mx-auto px-6">
          <p className="font-canaro text-xs uppercase tracking-widest text-blue-300 mb-3">
            roc van twente
          </p>
          <h1 className="font-canaro font-bold text-4xl text-white lowercase mb-4">
            alle rondleidingen
          </h1>
          <p className="text-blue-200 text-lg max-w-lg">
            Kies de rondleiding die bij jou past en ontdek jouw toekomst bij
            roc van twente.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-12">
        {/* Search */}
        <div className="flex items-center gap-3 border-b-2 border-roc-blue pb-3 mb-10 max-w-md">
          <Search size={18} className="text-roc-blue" />
          <input
            type="text"
            placeholder="zoek een rondleiding..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent font-body text-sm focus:outline-none placeholder-gray-400"
          />
        </div>

        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-52 bg-gray-100 animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <p className="text-roc-red font-canaro font-bold">{error}</p>
        )}

        {!loading && !error && (
          <>
            <p className="text-xs text-gray-400 font-canaro uppercase tracking-wide mb-6">
              {filtered.length} rondleiding{filtered.length !== 1 ? "en" : ""}
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}

function TourCard({ tour }: { tour: Tour }) {
  return (
    <Link
      to={`/tours/${tour.id}`}
      className="group block no-underline bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200"
    >
      <div className="h-1.5 bg-roc-blue group-hover:bg-roc-red transition-colors duration-200" />
      <div className="p-6 flex flex-col h-full">
        <h2 className="font-canaro font-bold text-roc-dark lowercase mb-2 group-hover:text-roc-blue transition-colors">
          {tour.title}
        </h2>
        <p className="text-gray-500 text-sm leading-relaxed flex-1 mb-4">
          {tour.description}
        </p>
        <div className="flex flex-wrap gap-4 text-xs text-gray-400 mb-4">
          <span className="flex items-center gap-1"><Clock size={12} className="text-roc-blue" />{tour.durationMinutes} min</span>
          <span className="flex items-center gap-1"><Users size={12} className="text-roc-blue" />max {tour.maxParticipants}</span>
          <span className="flex items-center gap-1"><MapPin size={12} className="text-roc-blue" />{tour.stops?.length ?? 0} stops</span>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-canaro font-bold text-roc-red hover:gap-2 transition-all">
          bekijk route <ArrowRight size={12} />
        </span>
      </div>
    </Link>
  );
}
