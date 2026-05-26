import { Link } from 'react-router';
import { ArrowRight, Compass, Building2 } from 'lucide-react';
import { Button } from '../../app/components/ui/button';

export function Home() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <section className="rounded-2xl border bg-gradient-to-r from-primary/10 to-secondary/20 p-8 shadow-sm md:p-12">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">ROC van Twente</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">Ontdek je weg door onze school</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Verken alle locaties, kies een route en navigeer stap voor stap door het gebouw.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/routes">
              Bekijk routes <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/locations">Alle locaties</Link>
          </Button>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border p-5">
          <Compass className="mb-3 size-5 text-primary" />
          <h2 className="text-lg font-semibold">Stap-voor-stap routes</h2>
          <p className="mt-2 text-sm text-muted-foreground">Heldere volgorde met richting en tijdsinschatting.</p>
        </div>
        <div className="rounded-xl border p-5">
          <Building2 className="mb-3 size-5 text-primary" />
          <h2 className="text-lg font-semibold">Locaties per gebouw en verdieping</h2>
          <p className="mt-2 text-sm text-muted-foreground">Snel filteren op gebouw en verdieping met zoekfunctie.</p>
        </div>
      </section>
    </main>
  );
}
