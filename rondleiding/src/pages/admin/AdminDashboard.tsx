import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../app/components/ui/card';
import { buildingService } from '../../services/buildingService';
import { locationService } from '../../services/locationService';
import { routeService } from '../../services/routeService';
import type { DashboardStats } from '../../types';

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({ routes: 0, locations: 0, buildings: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([routeService.getAll(), locationService.getAll(), buildingService.getAll()])
      .then(([routes, locations, buildings]) => {
        setStats({ routes: routes.length, locations: locations.length, buildings: buildings.length });
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Dashboard laden mislukt'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p>Dashboard laden...</p>;
  }

  if (error) {
    return <p className="text-destructive">{error}</p>;
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Routes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats.routes}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Locaties</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats.locations}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Gebouwen</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats.buildings}</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
