import { Link } from 'react-router';
import { Clock3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../app/components/ui/card';
import { Button } from '../app/components/ui/button';
import type { GuideRoute } from '../types';

interface RouteCardProps {
  route: GuideRoute;
}

export function RouteCard({ route }: RouteCardProps) {
  return (
    <Card className="z-index-10 h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">{route.name}</CardTitle>
        <CardDescription>{route.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p className="flex items-center gap-2">
          <Clock3 className="size-4" />
          {route.estimatedTimeMinutes} minuten
        </p>
        <p>lengte: {route.difficulty}</p>
      </CardContent>
      <CardFooter className="pt-0">
        <Button asChild className="w-full uppercase tracking-[0.08em]">
          <Link to={`/routes/${route.id}`}>bekijk route</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
