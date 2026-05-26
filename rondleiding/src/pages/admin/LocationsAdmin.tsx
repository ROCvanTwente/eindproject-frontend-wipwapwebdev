import { FormEvent, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../../app/components/ui/button';
import { Input } from '../../app/components/ui/input';
import { Label } from '../../app/components/ui/label';
import { buildingService } from '../../services/buildingService';
import { locationService } from '../../services/locationService';
import type { Building, Location } from '../../types';

const emptyForm = { name: '', description: '', imageUrl: '', floor: '', buildingId: '' };

export function LocationsAdmin() {
  const [items, setItems] = useState<Location[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadData = async () => {
    const [locations, buildingList] = await Promise.all([locationService.getAll(), buildingService.getAll()]);
    setItems(locations);
    setBuildings(buildingList);
  };

  useEffect(() => {
    loadData().catch(() => toast.error('Locaties laden mislukt'));
  }, []);

  const buildingNameLookup = useMemo(() => {
    return new Map(buildings.map((building) => [building.id, building.name]));
  }, [buildings]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      const payload = {
        name: form.name,
        description: form.description,
        imageUrl: form.imageUrl,
        floor: form.floor,
        buildingId: form.buildingId || undefined,
      };

      if (editingId) {
        await locationService.update(editingId, payload);
        toast.success('Locatie bijgewerkt');
      } else {
        await locationService.create(payload);
        toast.success('Locatie toegevoegd');
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadData();
    } catch {
      toast.error('Opslaan mislukt');
    }
  };

  const [draggedId, setDraggedId] = useState<string | null>(null);

  const reorder = (sourceId: string, targetId: string) => {
    setItems((prev) => {
      const sourceIndex = prev.findIndex((item) => item.id === sourceId);
      const targetIndex = prev.findIndex((item) => item.id === targetId);

      if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
        return prev;
      }

      const next = [...prev];
      const [moved] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  };

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Locaties beheren</h1>

      <form onSubmit={handleSubmit} className="grid gap-3 rounded-xl border p-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="location-name">Naam</Label>
          <Input
            id="location-name"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location-description">Beschrijving</Label>
          <Input
            id="location-description"
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location-image">Afbeelding URL</Label>
          <Input
            id="location-image"
            value={form.imageUrl}
            onChange={(event) => setForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location-floor">Verdieping</Label>
          <Input
            id="location-floor"
            value={form.floor}
            onChange={(event) => setForm((prev) => ({ ...prev, floor: event.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location-building">Gebouw</Label>
          <select
            id="location-building"
            value={form.buildingId}
            onChange={(event) => setForm((prev) => ({ ...prev, buildingId: event.target.value }))}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="">Kies gebouw</option>
            {buildings.map((building) => (
              <option key={building.id} value={building.id}>
                {building.name}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-3 flex gap-2">
          <Button type="submit">{editingId ? 'Update' : 'Toevoegen'}</Button>
          {editingId ? (
            <Button type="button" variant="outline" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
              Annuleren
            </Button>
          ) : null}
        </div>
      </form>

      <p className="text-sm text-muted-foreground">Sleep locaties om de volgorde te wijzigen.</p>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            draggable
            onDragStart={() => setDraggedId(item.id)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (draggedId) {
                reorder(draggedId, item.id);
                setDraggedId(null);
              }
            }}
            className="flex cursor-move flex-wrap items-center justify-between gap-2 rounded-md border p-3"
          >
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-muted-foreground">
                {buildingNameLookup.get(item.buildingId ?? '') || item.buildingName || 'Onbekend gebouw'} • {item.floor || '-'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingId(item.id);
                  setForm({
                    name: item.name,
                    description: item.description,
                    imageUrl: item.imageUrl ?? '',
                    floor: item.floor ?? '',
                    buildingId: item.buildingId ?? '',
                  });
                }}
              >
                Bewerken
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  try {
                    await locationService.remove(item.id);
                    toast.success('Locatie verwijderd');
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
