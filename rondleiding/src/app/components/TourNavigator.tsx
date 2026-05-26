import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, X, MapPin } from 'lucide-react';
import type { TourPoint } from './types';

interface TourNavigatorProps {
  tourPoint: TourPoint;
  onClose: () => void;
}

export function TourNavigator({ tourPoint, onClose }: TourNavigatorProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const sortedSlides = [...tourPoint.slides].sort((a, b) => a.order - b.order);
  const currentSlide = sortedSlides[currentSlideIndex];
  const isFirstSlide = currentSlideIndex === 0;
  const isLastSlide = currentSlideIndex === sortedSlides.length - 1;

  const handleNext = () => {
    if (!isLastSlide) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstSlide) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  const handleComplete = () => {
    onClose();
  };

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'linear-gradient(var(--diagonal-angle), #ffffff 0%, #f5f5f5 100%)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6" style={{ color: 'var(--roc-red)' }} />
            <div>
              <h1 className="text-2xl" style={{ color: 'var(--roc-blue)' }}>
                {tourPoint.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                stap {currentSlideIndex + 1} van {sortedSlides.length}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${((currentSlideIndex + 1) / sortedSlides.length) * 100}%`,
                backgroundColor: 'var(--roc-blue)'
              }}
            />
          </div>
        </div>

        {/* Slide content */}
        {currentSlide && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              {/* Foto (als beschikbaar) */}
              {currentSlide.imageUrl && (
                <div className="mb-6 rounded-md overflow-hidden">
                  <img
                    src={currentSlide.imageUrl}
                    alt={`stap ${currentSlideIndex + 1}`}
                    className="w-full h-auto object-cover"
                    style={{ maxHeight: '400px' }}
                  />
                </div>
              )}

              {/* Instructie */}
              <div className="space-y-4">
                <h2 className="text-xl">stap {currentSlideIndex + 1}</h2>
                <p className="text-lg leading-relaxed">{currentSlide.instruction}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigatie knoppen */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={isFirstSlide}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            vorige
          </Button>

          <div className="flex gap-1">
            {sortedSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlideIndex(index)}
                className="w-2 h-2 rounded-full transition-all"
                style={{
                  backgroundColor: index === currentSlideIndex ? 'var(--roc-blue)' : '#d4d4d4',
                  width: index === currentSlideIndex ? '24px' : '8px'
                }}
                aria-label={`ga naar stap ${index + 1}`}
              />
            ))}
          </div>

          {isLastSlide ? (
            <Button onClick={handleComplete} className="gap-2">
              afronden
            </Button>
          ) : (
            <Button onClick={handleNext} className="gap-2">
              volgende
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Extra info kaart aan de onderkant */}
        {tourPoint.description && (
          <Card className="mt-6" style={{ backgroundColor: 'var(--roc-blue)' }}>
            <CardContent className="pt-6" style={{ color: 'white' }}>
              <h3 className="text-sm font-bold mb-2 uppercase tracking-wide opacity-80">
                over dit punt
              </h3>
              <p>{tourPoint.description}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
