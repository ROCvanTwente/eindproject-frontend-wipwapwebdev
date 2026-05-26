import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../../app/components/ui/button';
import { Input } from '../../app/components/ui/input';
import { Label } from '../../app/components/ui/label';
import { buildingService } from '../../services/buildingService';
import type { Building } from '../../types';

const emptyForm = { name: '', description: '', address: '' };

export function BuildingsAdmin() {
  const [items, setItems] = useState<Building[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadData = async () => {
    const data = await buildingService.getAll();
    setItems(data);
  };

  useEffect(() => {
    loadData().catch(() => toast.error('Gebouwen laden mislukt'));
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      if (editingId) {
        await buildingService.update(editingId, form);
        toast.success('Gebouw bijgewerkt');
      } else {
        await buildingService.create(form);
        toast.success('Gebouw toegevoegd');
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadData();
    } catch {
      toast.error('Opslaan mislukt');
    }
  };

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Gebouwen beheren</h1>

      <form onSubmit={handleSubmit} className="grid gap-3 rounded-xl border p-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="building-name">Naam</Label>
          <Input
            id="building-name"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="building-description">Beschrijving</Label>
          <Input
            id="building-description"
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="building-address">Adres</Label>
          <Input
            id="building-address"
            value={form.address}
            onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
          />
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

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3">
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-muted-foreground">{item.description || 'Geen beschrijving'}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingId(item.id);
                  setForm({
                    name: item.name,
                    description: item.description ?? '',
                    address: item.address ?? '',
                  });
                }}
              >
                Bewerken
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  try {
                    await buildingService.remove(item.id);
                    toast.success('Gebouw verwijderd');
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
