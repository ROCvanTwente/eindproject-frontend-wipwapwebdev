import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../app/components/ui/card';
import type { Location } from '../types';

interface LocationCardProps {
  location: Location;
}

export function LocationCard({ location }: LocationCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="h-40 bg-muted">
        {location.imageUrl ? (
          <img src={location.imageUrl} alt={location.name} className="size-full object-cover" loading="lazy" />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">Geen afbeelding</div>
        )}
      </div>
      <CardHeader>
        <CardTitle className="text-lg">{location.name}</CardTitle>
        <CardDescription>
          {location.buildingName || 'Onbekend gebouw'} {location.floor ? `• ${location.floor}` : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{location.description}</p>
      </CardContent>
    </Card>
  );
}
