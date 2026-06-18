import { FormEvent, useEffect, useMemo, useState, DragEvent, ChangeEvent, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '../../app/components/ui/button';
import { Label } from '../../app/components/ui/label';
import { Textarea } from '../../app/components/ui/textarea';
import { Input } from '../../app/components/ui/input';
import { buildingService } from '../../services/buildingService';
import { locationService } from '../../services/locationService';
import type { Building, Location } from '../../types';

type LocationFormState = {
  name: string;
  description: string;
  imageUrl: string; 
  floor: string;
  buildingId: string;
};

const emptyForm: LocationFormState = { name: '', description: '', imageUrl: '', floor: '', buildingId: '' };

// HOOGWAARDIGE COMPRESSOR & VERKLEINER (Zonder extra npm packages)
const compressAndResizeImage = (file: File, maxWidth = 1024, maxHeight = 1024, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Bereken nieuwe verhoudingen op basis van de max breedte/hoogte
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context kon niet worden aangemaakt.'));
          return;
        }

        // Teken de afbeelding op het kleinere canvas
        ctx.drawImage(img, 0, 0, width, height);
        
        // Exporteer naar een compacte JPEG Base64 string (kwaliteit 0.7 = 70%)
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export function LocationsAdmin() {
  const [items, setItems] = useState<Location[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [form, setForm] = useState<LocationFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isConvertingImage, setIsConvertingImage] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [locations, buildingList] = await Promise.all([locationService.getAll(), buildingService.getAll()]);
      setItems(locations);
      setBuildings(buildingList);
    } catch {
      toast.error('Data inladen mislukt');
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const buildingNameLookup = useMemo(() => {
    return new Map(buildings.map((building) => [building.id, building.name]));
  }, [buildings]);

  const handleImageSelection = useCallback(async (selectedFile: File | null | undefined) => {
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/')) {
      toast.error('Alleen afbeeldingen zijn toegestaan');
      return;
    }

    setIsConvertingImage(true);

    try {
      // Hier wordt de afbeelding verkleind naar max 1024px breed/hoog en gecomprimeerd naar 70% kwaliteit
      const compressedBase64 = await compressAndResizeImage(selectedFile, 1024, 1024, 0.7);

      setForm((prev) => ({ ...prev, imageUrl: compressedBase64 }));
      toast.success('Afbeelding succesvol verkleind en ingeladen');
    } catch (error) {
      console.error("[Conversie] Fout:", error);
      toast.error('Fout bij het verwerken van de afbeelding');
      setForm((prev) => ({ ...prev, imageUrl: '' }));
    } finally {
      setIsConvertingImage(false);
    }
  }, []);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingFile(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    await handleImageSelection(file);
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    await handleImageSelection(file);
    e.target.value = ''; 
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        imageUrl: form.imageUrl.trim() || undefined,
        floor: Number(form.floor || 0),
        buildingId: Number(form.buildingId),
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
      toast.error('Opslaan mislukt. Is de afbeelding te groot?');
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
          <Textarea
            id="location-description"
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location-image">Afbeelding (wordt automatisch verkleind)</Label>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative flex h-24 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed text-center text-xs transition-colors ${
              isDraggingFile ? 'border-primary bg-primary/10' : 'border-muted-foreground/30 hover:bg-muted/50'
            }`}
          >
            <input
              type="file"
              id="location-image"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 cursor-pointer opacity-0"
              disabled={isConvertingImage}
            />
            
            {isConvertingImage ? (
                <div className="p-4 text-muted-foreground animate-pulse">
                    <p className="font-medium">Afbeelding comprimeren...</p>
                </div>
            ) : form.imageUrl ? (
              <div className="flex items-center gap-3 p-2 w-full h-full relative">
                <img src={form.imageUrl} alt="Preview" className="h-full w-16 rounded object-cover" />
                <span className="truncate text-muted-foreground">Afbeelding klaar (Klik/sleep om te wijzigen)</span>
                <button 
                  type="button" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setForm(prev => ({...prev, imageUrl: ''}));
                  }} 
                  className='absolute top-1 right-1 p-1 bg-white/80 rounded-full hover:bg-white text-destructive font-bold z-10 size-5 flex items-center justify-center border text-sm'
                >
                    &times;
                </button>
              </div>
            ) : (
              <div className="p-4 text-muted-foreground">
                <p className="font-medium">Klik om te zoeken</p>
                <p>of sleep een afbeelding hierheen</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location-floor">Verdieping</Label>
          <Input
            id="location-floor"
            type="number"
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
            required
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
                    toast.error('Verwijderen mislukt check of de locatie nog in een route zit.');
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
