import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { MapPin } from 'lucide-react';
import type { TourPoint } from './types';

interface UserMapProps {
  tourPoints: TourPoint[];
  onSelectPoint: (point: TourPoint) => void;
}

export function UserMap({ tourPoints, onSelectPoint }: UserMapProps) {
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);

  return (
    <div className="min-h-screen p-8" style={{ background: 'linear-gradient(var(--diagonal-angle), #ffffff 0%, #f5f5f5 100%)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl mb-2" style={{ color: 'var(--roc-blue)' }}>
            roc <span style={{ color: 'var(--roc-red)' }}>van</span> twente
          </h1>
          <h2 className="text-2xl">schoolrondleiding</h2>
          <p className="mt-2 text-muted-foreground">
            klik op een punt op de kaart om de rondleiding te starten
          </p>
        </div>

        <Card>
          <CardContent className="p-0">
            {/* Kaart container met aspect ratio */}
            <div className="relative w-full bg-muted" style={{ aspectRatio: '16/9' }}>
              {/* Placeholder kaart achtergrond */}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="text-center text-muted-foreground">
                  <MapPin className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>plattegrond van de school</p>
                  <p className="text-sm mt-1">(upload een afbeelding in het admin panel)</p>
                </div>
              </div>

              {/* Tour punten op de kaart */}
              {tourPoints.map((point) => (
                <button
                  key={point.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-110"
                  style={{
                    left: `${point.x}%`,
                    top: `${point.y}%`,
                  }}
                  onClick={() => onSelectPoint(point)}
                  onMouseEnter={() => setHoveredPoint(point.id)}
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  {/* Pin marker */}
                  <div
                    className="relative"
                    style={{
                      filter: hoveredPoint === point.id ? 'drop-shadow(0 4px 8px rgba(0,100,173,0.3))' : 'none'
                    }}
                  >
                    <MapPin
                      className="w-10 h-10"
                      style={{ color: 'var(--roc-red)' }}
                      fill="var(--roc-red)"
                    />

                    {/* Tooltip */}
                    {hoveredPoint === point.id && (
                      <div
                        className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 rounded-md whitespace-nowrap text-sm"
                        style={{
                          backgroundColor: 'var(--roc-blue)',
                          color: 'white'
                        }}
                      >
                        {point.name}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                          <div
                            className="w-0 h-0"
                            style={{
                              borderLeft: '6px solid transparent',
                              borderRight: '6px solid transparent',
                              borderTop: '6px solid var(--roc-blue)'
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lijst van beschikbare tour punten */}
        {tourPoints.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xl mb-4">beschikbare rondleidingen</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tourPoints.map((point) => (
                <Card
                  key={point.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => onSelectPoint(point)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-6 h-6 flex-shrink-0" style={{ color: 'var(--roc-red)' }} />
                      <div className="flex-1">
                        <h4 className="font-bold mb-1 text-base">{point.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{point.description}</p>
                        <div className="text-xs" style={{ color: 'var(--roc-blue)' }}>
                          {point.slides.length} stap{point.slides.length !== 1 ? 'pen' : ''}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
