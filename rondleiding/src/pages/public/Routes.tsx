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
    <main className="roc-page-shell">
      <section className="roc-strip roc-strip--white">
        <div className="roc-content-wrap roc-band">
          <div>
            <p className="roc-kicker text-primary">Routes</p>
            <h1 className="roc-title mt-3">Kies een route door de school</h1>
            <p className="roc-copy mt-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi elementum risus ut odio suscipit pretium. Vivamus metus urna, hendrerit sed.</p>
          </div>

          {loading ? <p>routes laden...</p> : null}
          {error ? <p className="text-destructive">{error}</p> : null}

          {!loading && !error ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {routes.map((route) => (
                <RouteCard key={route.id} route={route} />
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
