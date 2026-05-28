import { FormEvent, useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../app/components/ui/button';
import { Input } from '../../app/components/ui/input';
import { Label } from '../../app/components/ui/label';
import { locationService } from '../../services/locationService';
import { routeService } from '../../services/routeService';
import type { GuideRoute, Location, RouteLocation } from '../../types';

const emptyForm = { name: '', description: '', estimatedTimeMinutes: 0, difficulty: 'Easy' };

function reorder<T>(items: T[], from: number, to: number): T[] {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function RoutesAdmin() {
  const [routes, setRoutes] = useState<GuideRoute[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [selectedLocations, setSelectedLocations] = useState<RouteLocation[]>([]);
  const [nextLocationId, setNextLocationId] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadData = async () => {
    const [routeData, locationData] = await Promise.all([routeService.getAll(), locationService.getAll()]);
    setRoutes(routeData);
    setLocations(locationData);
  };

  useEffect(() => {
    loadData().catch(() => toast.error('Routes laden mislukt'));
  }, []);

  const addLocation = () => {
    if (!nextLocationId) {
      return;
    }

    const location = locations.find((entry) => entry.id === nextLocationId);
    if (!location) {
      return;
    }

    setSelectedLocations((prev) => [
      ...prev,
      {
        locationId: location.id,
        locationName: location.name,
        order: prev.length,
      },
    ]);
    setNextLocationId('');
  };

  const normalizeOrders = (items: RouteLocation[]) => items.map((item, index) => ({ ...item, order: index }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const payload = {
      ...form,
      estimatedTimeMinutes: Number(form.estimatedTimeMinutes),
      locations: normalizeOrders(selectedLocations),
    };

    try {
      if (editingId) {
        await routeService.update(editingId, payload);
        toast.success('Route bijgewerkt');
      } else {
        await routeService.create(payload);
        toast.success('Route toegevoegd');
      }

      setForm(emptyForm);
      setSelectedLocations([]);
      setEditingId(null);
      await loadData();
    } catch {
      toast.error('Opslaan mislukt');
    }
  };

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Routes beheren</h1>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="route-name">Naam</Label>
            <Input
              id="route-name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="route-time">Geschatte tijd (min)</Label>
            <Input
              id="route-time"
              type="number"
              min={1}
              value={form.estimatedTimeMinutes}
              onChange={(event) => setForm((prev) => ({ ...prev, estimatedTimeMinutes: Number(event.target.value) }))}
              required
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="route-description">Beschrijving</Label>
            <Input
              id="route-description"
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="route-difficulty">Moeilijkheid</Label>
            <select
              id="route-difficulty"
              value={form.difficulty}
              onChange={(event) => setForm((prev) => ({ ...prev, difficulty: event.target.value }))}
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        <div className="space-y-2 rounded-md border p-3">
          <p className="text-sm font-medium">Route builder (locaties in volgorde)</p>
          <div className="flex flex-wrap gap-2">
            <select
              value={nextLocationId}
              onChange={(event) => setNextLocationId(event.target.value)}
              className="h-9 min-w-56 rounded-md border bg-background px-3 text-sm"
            >
              <option value="">Kies locatie</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
            <Button type="button" variant="outline" onClick={addLocation}>
              <Plus className="mr-1 size-4" /> Toevoegen
            </Button>
          </div>

          <div className="space-y-2">
            {selectedLocations.map((item, index) => (
              <div key={`${item.locationId}-${index}`} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-2">
                <p className="text-sm">
                  {index + 1}. {item.locationName || item.locationId}
                </p>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={index === 0}
                    onClick={() => setSelectedLocations((prev) => normalizeOrders(reorder(prev, index, index - 1)))}
                  >
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={index === selectedLocations.length - 1}
                    onClick={() => setSelectedLocations((prev) => normalizeOrders(reorder(prev, index, index + 1)))}
                  >
                    <ArrowDown className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedLocations((prev) => normalizeOrders(prev.filter((_, i) => i !== index)))}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit">{editingId ? 'Update' : 'Toevoegen'}</Button>
          {editingId ? (
            <Button type="button" variant="outline" onClick={() => { setEditingId(null); setForm(emptyForm); setSelectedLocations([]); }}>
              Annuleren
            </Button>
          ) : null}
        </div>
      </form>

      <div className="space-y-2">
        {routes.map((route) => (
          <div key={route.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3">
            <div>
              <p className="font-medium">{route.name}</p>
              <p className="text-sm text-muted-foreground">{route.description}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingId(route.id);
                  setForm({
                    name: route.name,
                    description: route.description,
                    estimatedTimeMinutes: route.estimatedTimeMinutes,
                    difficulty: route.difficulty,
                  });
                  setSelectedLocations(
                    (route.locations ?? []).map((location, index) => ({ ...location, order: location.order ?? index })),
                  );
                }}
              >
                Bewerken
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  try {
                    await routeService.remove(route.id);
                    toast.success('Route verwijderd');
                    await loadData();
                  } catch {
                    toast.error('Verwijderen mislukt');
                  }
                }}
              >
                Verwijderen
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
