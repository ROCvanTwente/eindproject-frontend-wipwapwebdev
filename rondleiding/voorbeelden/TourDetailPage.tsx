import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Clock, Users, CheckCircle, Circle, MapPin } from "lucide-react";
import { toursApi } from "../services/api";
import type { Tour, TourStop } from "../types";

export function TourDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStop, setCurrentStop] = useState(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!id) return;
    toursApi
      .getById(Number(id))
      .then(setTour)
      .catch(() => setTour(mockTour))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="pt-24 max-w-4xl mx-auto px-6">
      <div className="h-8 w-64 bg-gray-100 animate-pulse mb-4" />
      <div className="h-4 w-full bg-gray-100 animate-pulse" />
    </div>
  );

  if (!tour) return (
    <div className="pt-24 max-w-4xl mx-auto px-6">
      <p className="text-roc-red font-canaro font-bold">rondleiding niet gevonden.</p>
    </div>
  );

  const stops = tour.stops ?? [];
  const activeStop: TourStop | undefined = stops[currentStop];
  const progress = stops.length > 0 ? (completed.size / stops.length) * 100 : 0;

  function goNext() {
    if (activeStop) setCompleted((s) => new Set(s).add(activeStop.id));
    if (currentStop < stops.length - 1) setCurrentStop((i) => i + 1);
  }

  function goPrev() {
    if (currentStop > 0) setCurrentStop((i) => i - 1);
  }

  return (
    <main className="pt-16">
      {/* Header */}
      <section className="bg-roc-blue text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(67deg, #E3001A 30%, transparent 30%)", mixBlendMode: "multiply" as const }} />
        <div className="relative max-w-5xl mx-auto px-6">
          <Link to="/tours" className="inline-flex items-center gap-2 text-blue-200 text-xs font-canaro uppercase tracking-wide mb-5 no-underline hover:text-white">
            <ArrowLeft size={14} /> alle rondleidingen
          </Link>
          <h1 className="font-canaro font-bold text-4xl text-white lowercase mb-3">{tour.title}</h1>
          <p className="text-blue-100 max-w-xl">{tour.description}</p>
          <div className="flex gap-6 mt-5 text-sm text-blue-200">
            <span className="flex items-center gap-1"><Clock size={14} />{tour.durationMinutes} minuten</span>
            <span className="flex items-center gap-1"><Users size={14} />max {tour.maxParticipants} personen</span>
            <span className="flex items-center gap-1"><MapPin size={14} />{stops.length} stops</span>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-10">

        {/* Sidebar: stop list */}
        <aside className="md:col-span-1">
          <p className="font-canaro font-bold text-xs uppercase tracking-widest text-gray-400 mb-4">route</p>

          {/* Progress bar */}
          {started && (
            <div className="mb-4">
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-roc-red transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-gray-400 mt-1">{completed.size} / {stops.length} stops voltooid</p>
            </div>
          )}

          <ul className="space-y-2">
            {stops.map((stop, i) => (
              <li key={stop.id}>
                <button
                  onClick={() => setCurrentStop(i)}
                  className={`w-full text-left flex items-start gap-3 p-3 border transition-colors duration-150 ${
                    i === currentStop
                      ? "border-roc-red bg-red-50"
                      : "border-transparent hover:border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <span className="mt-0.5 flex-shrink-0">
                    {completed.has(stop.id)
                      ? <CheckCircle size={16} className="text-roc-blue" />
                      : <Circle size={16} className={i === currentStop ? "text-roc-red" : "text-gray-300"} />
                    }
                  </span>
                  <span>
                    <span className={`block font-canaro font-bold text-xs lowercase ${i === currentStop ? "text-roc-red" : "text-roc-dark"}`}>
                      {stop.title}
                    </span>
                    <span className="text-gray-400 text-xs">{stop.locationName}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {!started && (
            <button
              onClick={() => setStarted(true)}
              className="btn-primary w-full mt-6 justify-center text-xs"
            >
              start rondleiding
            </button>
          )}
        </aside>

        {/* Main: active stop */}
        <div className="md:col-span-2">
          {!started ? (
            <div className="border-l-4 border-roc-blue p-8 bg-blue-50">
              <p className="font-canaro font-bold text-lg text-roc-blue lowercase mb-2">klaar om te beginnen?</p>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                Druk op "start rondleiding" om door de {stops.length} stops te navigeren.
                Je kunt op elk moment pauzeren of een stop overslaan.
              </p>
              <div className="flex gap-4">
                <button onClick={() => setStarted(true)} className="btn-primary text-xs">
                  start rondleiding <ArrowRight size={14} />
                </button>
                <Link to="/boeken" className="btn-secondary text-xs">
                  groep inschrijven
                </Link>
              </div>
            </div>
          ) : activeStop ? (
            <div key={activeStop.id} className="animate-fade-up">
              {/* Stop number */}
              <div className="flex items-center gap-3 mb-5">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-roc-red text-white font-canaro font-bold text-sm">
                  {currentStop + 1}
                </span>
                <span className="text-gray-400 text-xs font-canaro uppercase tracking-wide">
                  stop {currentStop + 1} van {stops.length}
                </span>
              </div>

              {activeStop.imageUrl && (
                <img
                  src={activeStop.imageUrl}
                  alt={activeStop.title}
                  className="w-full h-52 object-cover mb-6"
                />
              )}

              <h2 className="font-canaro font-bold text-2xl text-roc-dark lowercase mb-1">
                {activeStop.title}
              </h2>
              <p className="text-roc-blue text-sm font-canaro mb-5 flex items-center gap-1">
                <MapPin size={13} /> {activeStop.locationName}
              </p>
              <p className="text-gray-600 leading-relaxed mb-8">{activeStop.description}</p>

              <div className="flex items-center justify-between border-t border-gray-100 pt-6">
                <button
                  onClick={goPrev}
                  disabled={currentStop === 0}
                  className="btn-secondary text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ArrowLeft size={14} /> vorige
                </button>

                {currentStop === stops.length - 1 ? (
                  <Link to="/boeken" className="btn-primary text-xs">
                    rondleiding klaar — boek een plek!
                  </Link>
                ) : (
                  <button onClick={goNext} className="btn-primary text-xs">
                    volgende <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-400">geen stops beschikbaar.</p>
          )}
        </div>
      </div>
    </main>
  );
}

// ── Fallback mock ─────────────────────────────────────────────────────────────
const mockTour: Tour = {
  id: 1,
  title: "techniek & engineering",
  description: "Verken de werkplaatsen van onze technische opleidingen.",
  durationMinutes: 45,
  maxParticipants: 20,
  isActive: true,
  createdAt: "",
  stops: [
    { id: 1, tourId: 1, order: 1, title: "ontvangst & introductie", locationName: "Hoofdingang, Gieterij 200", description: "Je wordt welkom geheten door een studieadviseur die je de opbouw van de rondleiding uitlegt en vragen beantwoordt.", durationMinutes: 10 },
    { id: 2, tourId: 1, order: 2, title: "automotive werkplaats", locationName: "Hal B, begane grond", description: "Bekijk de moderne autowerkplaatsen waar studenten werken aan echte voertuigen.", durationMinutes: 15 },
    { id: 3, tourId: 1, order: 3, title: "elektrotechniek lab", locationName: "Hal C, 1e verdieping", description: "Ontdek hoe studenten elektrotechnische installaties aanleggen en testen.", durationMinutes: 10 },
    { id: 4, tourId: 1, order: 4, title: "afsluiting & vragen", locationName: "Studieloopbaancentrum", description: "Stel al je vragen aan een studieadviseur en ontvang informatiemateriaal.", durationMinutes: 10 },
  ],
};
