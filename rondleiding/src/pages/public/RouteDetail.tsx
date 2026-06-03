import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { Alert, AlertDescription } from '../../app/components/ui/alert';
import { Button } from '../../app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../app/components/ui/card';
import { useSpeech } from '../../hooks/useSpeech';
import { locationService } from '../../services/locationService';
import { routeService } from '../../services/routeService';
import type { GuideRoute } from '../../types';

export function RouteDetail() {
  const { routeId } = useParams();
  const [route, setRoute] = useState<GuideRoute | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const { speak, pause, resume, stop, isPlaying, isPaused, isSpeechSupported, hasVoices, speechError } = useSpeech({ language: 'nl-NL' });

  useEffect(() => {
    if (!routeId) {
      setError('Route niet gevonden');
      setLoading(false);
      return;
    }

    Promise.all([routeService.getById(routeId), locationService.getAll()])
      .then(([result, locations]) => {
        const locationMap = new Map(locations.map((location) => [location.id, location]));
        const enrichedRoute: GuideRoute = {
          ...result,
          locations: result.locations?.map((step) => {
            const location = locationMap.get(step.locationId);

            return {
              ...step,
              locationName: step.locationName || location?.name || '',
              locationDescription: step.locationDescription || location?.description || '',
            };
          }),
        };

        setRoute(enrichedRoute);
        setActiveStep(0);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Route laden mislukt'))
      .finally(() => setLoading(false));
  }, [routeId]);

  useEffect(() => {
    stop();
  }, [activeStep]);

  const orderedSteps = useMemo(() => (route?.locations ?? []).slice().sort((a, b) => a.order - b.order), [route]);
  const currentStep = orderedSteps[activeStep];
  const currentStepDescription = currentStep?.locationDescription?.trim() || '';

  const handleSpeakCurrentStep = () => {
    if (!route || !currentStep) {
      return;
    }

    const spokenText = [
      currentStepDescription,
      currentStep.direction || '',
    ]
      .map((part) => part.trim())
      .filter(Boolean)
      .join('. ');

    if (!spokenText) {
      return;
    }

    speak(spokenText);
  };

  const handleToggleSpeech = () => {
    if (isPlaying) {
      pause();
      return;
    }

    if (isPaused) {
      resume();
      return;
    }

    handleSpeakCurrentStep();
  };

  return (
    <main className="roc-page-shell">
      <section className="roc-strip roc-strip--white">
        <div className="roc-content-wrap roc-band">
          <Button asChild variant="ghost" className="w-fit px-0 text-primary uppercase tracking-[0.08em] hover:bg-transparent hover:text-primary">
            <Link to="/routes">terug naar routes</Link>
          </Button>

          {loading ? <p>route laden...</p> : null}
          {error ? <p className="text-destructive">{error}</p> : null}

          {route ? (
            <section className="space-y-6">
              <div className="roc-panel p-6 md:p-8">
                <p className="roc-kicker text-primary">route detail</p>
                <h1 className="roc-title mt-3">{route.name}</h1>
                <p className="roc-copy mt-4">{route.description}</p>
                <p className="mt-3 text-sm text-muted-foreground">
                  {route.estimatedTimeMinutes} minuten • {route.difficulty}
                </p>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <CardTitle className="lowercase">
                      stap {activeStep + 1} van {orderedSteps.length}
                    </CardTitle>
                    {route && currentStep && isSpeechSupported ? (
                      <Button type="button" variant="outline" size="sm" onClick={handleToggleSpeech} className="gap-2 uppercase tracking-[0.08em]">
                        {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
                        {isPlaying ? 'pauze' : isPaused ? 'hervat' : 'afspelen'}
                      </Button>
                    ) : null}
                  </div>
                  {speechError ? (
                    <Alert variant="destructive">
                      <AlertDescription>{speechError}</AlertDescription>
                    </Alert>
                  ) : null}
                  {isSpeechSupported && !hasVoices ? (
                    <p className="text-sm text-muted-foreground">
                      Geen spraakstem gevonden in deze browser. Controleer de browser- of Windows-spraakinstellingen.
                    </p>
                  ) : null}
                </CardHeader>
                <CardContent className="space-y-3">
                  {currentStep ? (
                    <>
                      <p className="font-semibold">{currentStep.locationName || currentStep.locationId}</p>
                      <p className="text-sm text-muted-foreground">
                        {currentStep.locationDescription || currentStep.direction || route.description || 'Geen beschrijving toegevoegd.'}
                      </p>
                      {currentStep.direction ? <p className="text-sm text-muted-foreground">{currentStep.direction}</p> : null}
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
                      className="uppercase tracking-[0.08em]"
                    >
                      <ChevronLeft className="size-4" /> vorige
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setActiveStep((prev) => Math.min(orderedSteps.length - 1, prev + 1))}
                      disabled={orderedSteps.length === 0 || activeStep >= orderedSteps.length - 1}
                      className="uppercase tracking-[0.08em]"
                    >
                      volgende <ChevronRight className="size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                {orderedSteps.map((step, index) => (
                  <button
                    key={step.id ?? `${step.locationId}-${index}`}
                    type="button"
                    onClick={() => setActiveStep(index)}
                    className={`rounded-[2mm] border px-3 py-3 text-left text-sm transition ${
                      index === activeStep ? 'border-primary bg-primary/5 text-primary shadow-[0_10px_24px_rgba(0,72,152,0.08)]' : 'border-border/70 bg-white hover:bg-accent'
                    }`}
                  >
                    <p className="font-semibold lowercase">
                      {index + 1}. {step.locationName || step.locationId}
                    </p>
                  </button>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </section>
    </main>
  );
}
