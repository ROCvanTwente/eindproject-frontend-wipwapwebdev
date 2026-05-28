import { useEffect, useMemo, useState } from 'react';
import { Input } from '../../app/components/ui/input';
import { Label } from '../../app/components/ui/label';
import { LocationCard } from '../../components/LocationCard';
import { buildingService } from '../../services/buildingService';
import { locationService } from '../../services/locationService';
import type { Building, Location } from '../../types';

export function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [search, setSearch] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('all');
  const [floorFilter, setFloorFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([locationService.getAll(), buildingService.getAll()])
      .then(([locationData, buildingData]) => {
        setLocations(locationData);
        setBuildings(buildingData);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Locaties laden mislukt'))
      .finally(() => setLoading(false));
  }, []);

  const floors = useMemo(
    () => Array.from(new Set(locations.map((item) => item.floor).filter(Boolean))).sort() as string[],
    [locations],
  );

  const filteredLocations = useMemo(() => {
    const q = search.trim().toLowerCase();
    return locations.filter((location) => {
      const matchesQuery =
        !q || location.name.toLowerCase().includes(q) || location.description.toLowerCase().includes(q);
      const matchesBuilding =
        buildingFilter === 'all' || location.buildingId === buildingFilter || location.buildingName === buildingFilter;
      const matchesFloor = floorFilter === 'all' || location.floor === floorFilter;
      return matchesQuery && matchesBuilding && matchesFloor;
    });
  }, [locations, search, buildingFilter, floorFilter]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Locaties</h1>
      <p className="mt-2 text-muted-foreground">Zoek en filter locaties binnen de school.</p>

      <section className="mt-6 grid gap-3 rounded-xl border p-4 sm:grid-cols-3">
        <div className="space-y-2 sm:col-span-3 lg:col-span-1">
          <Label htmlFor="location-search">Zoeken</Label>
          <Input
            id="location-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Zoek op naam of beschrijving"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="building-filter">Gebouw</Label>
          <select
            id="building-filter"
            value={buildingFilter}
            onChange={(event) => setBuildingFilter(event.target.value)}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="all">Alle gebouwen</option>
            {buildings.map((building) => (
              <option key={building.id} value={building.id}>
                {building.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="floor-filter">Verdieping</Label>
          <select
            id="floor-filter"
            value={floorFilter}
            onChange={(event) => setFloorFilter(event.target.value)}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="all">Alle verdiepingen</option>
            {floors.map((floor) => (
              <option key={floor} value={floor}>
                {floor}
              </option>
            ))}
          </select>
        </div>
      </section>

      {loading ? <p className="mt-6">Locaties laden...</p> : null}
      {error ? <p className="mt-6 text-destructive">{error}</p> : null}

      {!loading && !error ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredLocations.map((location) => (
            <LocationCard key={location.id} location={location} />
          ))}
        </div>
      ) : null}
    </main>
  );
}
