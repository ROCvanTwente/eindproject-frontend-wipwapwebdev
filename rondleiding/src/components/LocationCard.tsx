import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../app/components/ui/card';
import type { Location } from '../types';

interface LocationCardProps {
  location: Location;
}

export function LocationCard({ location }: LocationCardProps) {
  return (
    <Card className="z-index-10 overflow-hidden">
      <div className="roc-wide-image">
        {location.imageUrl ? (
          <img src={location.imageUrl} alt={location.name} className="size-full object-cover" loading="lazy" />
        ) : (
          <div className="flex size-full items-center justify-center px-4 text-center text-muted-foreground">geen afbeelding</div>
        )}
        <span className="roc-diagonal-overlay roc-diagonal-overlay--teal" />
      </div>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">{location.name}</CardTitle>
        <CardDescription>
          {location.buildingName || 'Onbekend gebouw'} {location.floor ? `• ${location.floor}` : ''}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground whitespace-pre-line">{location.description}</p>
      </CardContent>
    </Card>
  );
}
