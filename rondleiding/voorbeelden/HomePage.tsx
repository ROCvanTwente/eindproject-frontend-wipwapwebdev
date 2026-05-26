import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, Users, MapPin } from "lucide-react";
import { toursApi } from "../services/api";
import type { Tour } from "../types";

export function HomePage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    toursApi
      .getAll(true)
      .then(setTours)
      .catch(() => setTours(mockTours))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      {/* ── Hero ── */}
      <section className="relative bg-roc-blue text-white overflow-hidden min-h-[70vh] flex items-center">
        {/* Diagonal red overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(67deg, #E3001A 38%, transparent 38%)",
            mixBlendMode: "multiply",
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-up">
            <p className="font-canaro text-xs uppercase tracking-widest text-red-200 mb-4">
              roc van twente · welkom
            </p>
            <h1 className="font-canaro font-bold text-white text-5xl md:text-6xl leading-tight lowercase mb-6">
              ontdek jouw toekomst bij roc van twente
            </h1>
            <p className="text-blue-100 text-lg leading-relaxed mb-8 max-w-md">
              Doe mee aan een rondleiding en ervaar zelf hoe het is om te studeren
              op roc van twente. Nieuwsgierig, persoonlijk en voor iedereen.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/tours" className="btn-primary">
                bekijk rondleidingen <ArrowRight size={16} />
              </Link>
              <Link
                to="/boeken"
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white text-white font-canaro font-bold text-sm uppercase tracking-wide hover:bg-white hover:text-roc-blue transition-colors"
              >
                plan een bezoek
              </Link>
            </div>
          </div>

          {/* Stats block */}
          <div className="hidden md:grid grid-cols-2 gap-4 animate-fade-up delay-200">
            {[
              { num: "120+", label: "opleidingen" },
              { num: "13.000", label: "studenten" },
              { num: "4", label: "locaties" },
              { num: "1.200", label: "medewerkers" },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white/10 backdrop-blur-sm border border-white/20 p-6"
              >
                <p className="font-canaro font-bold text-4xl text-white">
                  {s.num}
                </p>
                <p className="text-blue-200 text-sm mt-1 lowercase">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Intro strip ── */}
      <section className="bg-roc-light py-10 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap gap-8 items-center justify-between">
          {["nieuwsgierig", "verbindend", "inspirerend", "persoonlijk", "trots", "voor iedereen"].map(
            (v) => (
              <span key={v} className="roc-pill">
                {v}
              </span>
            )
          )}
        </div>
      </section>

      {/* ── Tours ── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="font-canaro text-xs uppercase tracking-widest text-roc-blue mb-2">
              plan je bezoek
            </p>
            <h2 className="font-canaro font-bold text-3xl lowercase">
              kies een rondleiding
            </h2>
          </div>
          <Link to="/tours" className="btn-ghost hidden md:inline-flex">
            alle rondleidingen <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-56 bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {tours.slice(0, 3).map((tour, i) => (
              <TourCard key={tour.id} tour={tour} delay={i * 100} />
            ))}
          </div>
        )}
      </section>

      {/* ── CTA Banner ── */}
      <section className="bg-roc-red text-white">
        <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="font-canaro font-bold text-3xl lowercase mb-3">
              klaar om te ontdekken?
            </h2>
            <p className="text-red-100 text-lg max-w-md">
              Schrijf je in voor een open dag of rondleiding en laat je
              verrassen door alles wat roc van twente te bieden heeft.
            </p>
          </div>
          <Link
            to="/boeken"
            className="flex-shrink-0 inline-flex items-center gap-2 px-8 py-4 bg-white text-roc-red font-canaro font-bold text-sm uppercase tracking-wide hover:bg-gray-100 transition-colors"
          >
            boek jouw plek <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}

function TourCard({ tour, delay }: { tour: Tour; delay: number }) {
  return (
    <Link
      to={`/tours/${tour.id}`}
      className="group block no-underline bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Colour bar */}
      <div className="h-2 bg-roc-blue group-hover:bg-roc-red transition-colors duration-200" />

      <div className="p-6">
        <h3 className="font-canaro font-bold text-base text-roc-dark lowercase mb-2 group-hover:text-roc-blue transition-colors">
          {tour.title}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-5 line-clamp-2">
          {tour.description}
        </p>

        <div className="flex flex-wrap gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Clock size={12} className="text-roc-blue" />
            {tour.durationMinutes} min
          </span>
          <span className="flex items-center gap-1">
            <Users size={12} className="text-roc-blue" />
            max {tour.maxParticipants} pers.
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={12} className="text-roc-blue" />
            {tour.stops?.length ?? 0} stops
          </span>
        </div>
      </div>

      <div className="px-6 pb-5">
        <span className="btn-ghost p-0 text-xs text-roc-red">
          bekijk route <ArrowRight size={12} />
        </span>
      </div>
    </Link>
  );
}

// ── Fallback mock data (shown when API is offline) ──────────────────────────
const mockTours: Tour[] = [
  {
    id: 1,
    title: "techniek & engineering",
    description:
      "Verken de werkplaatsen van onze technische opleidingen. Van automotive tot elektrotechniek.",
    durationMinutes: 45,
    maxParticipants: 20,
    isActive: true,
    stops: [{} as any, {} as any, {} as any],
    createdAt: "",
  },
  {
    id: 2,
    title: "zorg & welzijn",
    description:
      "Ontdek hoe wij studenten opleiden voor een carrière in de gezondheidszorg en maatschappelijke dienstverlening.",
    durationMinutes: 40,
    maxParticipants: 15,
    isActive: true,
    stops: [{} as any, {} as any],
    createdAt: "",
  },
  {
    id: 3,
    title: "economie & ict",
    description:
      "Ga langs bij onze economische en digitale afdelingen en leer meer over de kansen in deze sectoren.",
    durationMinutes: 50,
    maxParticipants: 25,
    isActive: true,
    stops: [{} as any, {} as any, {} as any, {} as any],
    createdAt: "",
  },
];
