import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../app/components/ui/card';
import { routeService } from '../../services/routeService';
import type { GuideRoute } from '../../types';

export function RouteDetail() {
  const { routeId } = useParams();
  const [route, setRoute] = useState<GuideRoute | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!routeId) {
      setError('Route niet gevonden');
      setLoading(false);
      return;
    }

    routeService
      .getById(routeId)
      .then((result) => {
        setRoute(result);
        setActiveStep(0);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Route laden mislukt'))
      .finally(() => setLoading(false));
  }, [routeId]);

  const orderedSteps = useMemo(() => (route?.locations ?? []).slice().sort((a, b) => a.order - b.order), [route]);
  const currentStep = orderedSteps[activeStep];

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <Button asChild variant="ghost" className="mb-4">
        <Link to="/routes">← Terug naar routes</Link>
      </Button>

      {loading ? <p>Route laden...</p> : null}
      {error ? <p className="text-destructive">{error}</p> : null}

      {route ? (
        <section className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{route.name}</h1>
            <p className="mt-2 text-muted-foreground">{route.description}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {route.estimatedTimeMinutes} minuten • {route.difficulty}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                Stap {activeStep + 1} van {orderedSteps.length}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentStep ? (
                <>
                  <p className="font-medium">{currentStep.locationName || currentStep.locationId}</p>
                  <p className="text-sm text-muted-foreground">{currentStep.direction || 'Geen richting toegevoegd.'}</p>
                  <p className="text-sm text-muted-foreground">
                    Geschatte tijd: {currentStep.estimatedMinutes ?? '-'} minuten
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Deze route bevat nog geen locaties.</p>
              )}

              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                  disabled={activeStep === 0}
                >
                  <ChevronLeft className="size-4" /> Vorige
                </Button>
                <Button
                  type="button"
                  onClick={() => setActiveStep((prev) => Math.min(orderedSteps.length - 1, prev + 1))}
                  disabled={orderedSteps.length === 0 || activeStep >= orderedSteps.length - 1}
                >
                  Volgende <ChevronRight className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {orderedSteps.map((step, index) => (
              <button
                key={step.id ?? `${step.locationId}-${index}`}
                type="button"
                onClick={() => setActiveStep(index)}
                className={`rounded-md border px-3 py-2 text-left text-sm ${
                  index === activeStep ? 'border-primary bg-primary/5 text-primary' : 'hover:bg-accent'
                }`}
              >
                <p className="font-medium">{index + 1}. {step.locationName || step.locationId}</p>
              </button>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
