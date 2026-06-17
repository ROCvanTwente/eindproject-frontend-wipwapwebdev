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
    const q = search.trim();
    return locations.filter((location) => {
      const matchesQuery =
        !q || location.name.includes(q) || location.description.includes(q);
      const matchesBuilding =
        buildingFilter === 'all' || location.buildingId === buildingFilter || location.buildingName === buildingFilter;
      const matchesFloor = floorFilter === 'all' || location.floor === floorFilter;
      return matchesQuery && matchesBuilding && matchesFloor;
    });
  }, [locations, search, buildingFilter, floorFilter]);

  return (
    <main className="roc-page-shell">
      <section className="roc-strip roc-strip--white">
        <div className="roc-content-wrap roc-band">
          <div>
            <p className="roc-kicker text-primary">locaties</p>
            <h1 className="roc-title mt-3">Zoek en filter locaties binnen de school</h1>
            <p className="roc-copy mt-4">De filterstrook volgt de diagonale en strakke lay-out uit de huisstijl.</p>
          </div>

          <section className="roc-panel grid gap-4 p-5 sm:grid-cols-3 md:p-6">
            <div className="space-y-2 sm:col-span-3 lg:col-span-1">
              <Label htmlFor="location-search">zoeken</Label>
              <Input
                id="location-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="zoek op naam of beschrijving"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="building-filter">gebouw</Label>
              <select
                id="building-filter"
                value={buildingFilter}
                onChange={(event) => setBuildingFilter(event.target.value)}
                className="h-11 w-full rounded-[2mm] border border-border bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
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
                className="h-11 w-full rounded-[2mm] border border-border bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
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

          {loading ? <p>locaties laden...</p> : null}
          {error ? <p className="text-destructive">{error}</p> : null}

          {!loading && !error ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredLocations.map((location) => (
                <LocationCard key={location.id} location={location} />
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
