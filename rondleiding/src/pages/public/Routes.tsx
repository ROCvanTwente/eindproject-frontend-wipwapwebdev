import { useEffect, useState } from 'react';
import { RouteCard } from '../../components/RouteCard';
import { routeService } from '../../services/routeService';
import type { GuideRoute } from '../../types';

export function RoutesPage() {
  const [routes, setRoutes] = useState<GuideRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    routeService
      .getAll()
      .then(setRoutes)
      .catch((err) => setError(err instanceof Error ? err.message : 'Routes laden mislukt'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Routes</h1>
      <p className="mt-2 text-muted-foreground">Kies een route door de school.</p>

      {loading ? <p className="mt-6">Routes laden...</p> : null}
      {error ? <p className="mt-6 text-destructive">{error}</p> : null}

      {!loading && !error ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {routes.map((route) => (
            <RouteCard key={route.id} route={route} />
          ))}
        </div>
      ) : null}
    </main>
  );
}
