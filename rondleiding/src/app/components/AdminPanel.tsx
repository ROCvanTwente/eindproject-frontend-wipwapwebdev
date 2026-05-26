import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import type { TourPoint, TourSlide } from './types';

export function AdminPanel() {
  const [tourPoints, setTourPoints] = useState<TourPoint[]>([]);
  const [editingPoint, setEditingPoint] = useState<TourPoint | null>(null);
  const [isAddingPoint, setIsAddingPoint] = useState(false);

  const handleAddPoint = () => {
    const newPoint: TourPoint = {
      id: crypto.randomUUID(),
      name: '',
      description: '',
      x: 50,
      y: 50,
      slides: []
    };
    setEditingPoint(newPoint);
    setIsAddingPoint(true);
  };

  const handleSavePoint = () => {
    if (!editingPoint) return;

    if (isAddingPoint) {
      setTourPoints([...tourPoints, editingPoint]);
      setIsAddingPoint(false);
    } else {
      setTourPoints(tourPoints.map(p => p.id === editingPoint.id ? editingPoint : p));
    }
    setEditingPoint(null);
  };

  const handleDeletePoint = (id: string) => {
    setTourPoints(tourPoints.filter(p => p.id !== id));
  };

  const handleAddSlide = () => {
    if (!editingPoint) return;

    const newSlide: TourSlide = {
      id: crypto.randomUUID(),
      order: editingPoint.slides.length,
      instruction: '',
      imageUrl: ''
    };
    setEditingPoint({
      ...editingPoint,
      slides: [...editingPoint.slides, newSlide]
    });
  };

  const handleUpdateSlide = (slideId: string, field: keyof TourSlide, value: string | number) => {
    if (!editingPoint) return;

    setEditingPoint({
      ...editingPoint,
      slides: editingPoint.slides.map(s =>
        s.id === slideId ? { ...s, [field]: value } : s
      )
    });
  };

  const handleDeleteSlide = (slideId: string) => {
    if (!editingPoint) return;

    setEditingPoint({
      ...editingPoint,
      slides: editingPoint.slides.filter(s => s.id !== slideId)
    });
  };

  const handleMoveSlide = (slideId: string, direction: 'up' | 'down') => {
    if (!editingPoint) return;

    const slides = [...editingPoint.slides];
    const index = slides.findIndex(s => s.id === slideId);

    if ((direction === 'up' && index === 0) || (direction === 'down' && index === slides.length - 1)) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [slides[index], slides[newIndex]] = [slides[newIndex], slides[index]];

    slides.forEach((slide, idx) => {
      slide.order = idx;
    });

    setEditingPoint({
      ...editingPoint,
      slides
    });
  };

  return (
    <div className="min-h-screen p-8" style={{ background: 'linear-gradient(var(--diagonal-angle), #ffffff 0%, #f5f5f5 100%)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl mb-2" style={{ color: 'var(--roc-blue)' }}>
            roc <span style={{ color: 'var(--roc-red)' }}>van</span> twente
          </h1>
          <h2 className="text-2xl">rondleiding admin panel</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lijst van tour punten */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>tour punten</span>
                <Button onClick={handleAddPoint} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  nieuw punt
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tourPoints.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    nog geen tour punten toegevoegd
                  </p>
                ) : (
                  tourPoints.map(point => (
                    <div
                      key={point.id}
                      className="flex items-center justify-between p-3 border rounded-md hover:bg-accent cursor-pointer"
                      onClick={() => setEditingPoint(point)}
                    >
                      <div>
                        <div className="font-medium">{point.name || 'naamloos punt'}</div>
                        <div className="text-sm text-muted-foreground">
                          {point.slides.length} slide{point.slides.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePoint(point.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Editor voor geselecteerd punt */}
          {editingPoint && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {isAddingPoint ? 'nieuw tour punt' : 'bewerk tour punt'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="point-name">naam punt</Label>
                  <Input
                    id="point-name"
                    value={editingPoint.name}
                    onChange={(e) => setEditingPoint({ ...editingPoint, name: e.target.value })}
                    placeholder="bijvoorbeeld: hoofdingang"
                  />
                </div>

                <div>
                  <Label htmlFor="point-description">beschrijving</Label>
                  <Textarea
                    id="point-description"
                    value={editingPoint.description}
                    onChange={(e) => setEditingPoint({ ...editingPoint, description: e.target.value })}
                    placeholder="korte beschrijving van dit punt"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="point-x">x positie (%)</Label>
                    <Input
                      id="point-x"
                      type="number"
                      min="0"
                      max="100"
                      value={editingPoint.x}
                      onChange={(e) => setEditingPoint({ ...editingPoint, x: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="point-y">y positie (%)</Label>
                    <Input
                      id="point-y"
                      type="number"
                      min="0"
                      max="100"
                      value={editingPoint.y}
                      onChange={(e) => setEditingPoint({ ...editingPoint, y: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <Label>slides</Label>
                    <Button onClick={handleAddSlide} size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      slide toevoegen
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {editingPoint.slides.sort((a, b) => a.order - b.order).map((slide, index) => (
                      <Card key={slide.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-sm font-medium">slide {index + 1}</span>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMoveSlide(slide.id, 'up')}
                                disabled={index === 0}
                              >
                                <ArrowUp className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMoveSlide(slide.id, 'down')}
                                disabled={index === editingPoint.slides.length - 1}
                              >
                                <ArrowDown className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteSlide(slide.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Textarea
                              value={slide.instruction}
                              onChange={(e) => handleUpdateSlide(slide.id, 'instruction', e.target.value)}
                              placeholder="bijvoorbeeld: loop 200m rechtdoor"
                              rows={2}
                            />
                            <Input
                              value={slide.imageUrl || ''}
                              onChange={(e) => handleUpdateSlide(slide.id, 'imageUrl', e.target.value)}
                              placeholder="foto url (optioneel)"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSavePoint} className="flex-1">
                    opslaan
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingPoint(null);
                      setIsAddingPoint(false);
                    }}
                  >
                    annuleren
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
