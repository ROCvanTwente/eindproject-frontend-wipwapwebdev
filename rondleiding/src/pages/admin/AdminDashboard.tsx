import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Button } from '../../app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../app/components/ui/card';
import { buildingService } from '../../services/buildingService';
import { locationService } from '../../services/locationService';
import { routeService } from '../../services/routeService';
import type { DashboardStats } from '../../types';

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({ routes: 0, locations: 0, buildings: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState('');
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  useEffect(() => {
    Promise.all([routeService.getAll(), locationService.getAll(), buildingService.getAll()])
      .then(([routes, locations, buildings]) => {
        setStats({ routes: routes.length, locations: locations.length, buildings: buildings.length });
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Dashboard laden mislukt'))
      .finally(() => setLoading(false));
  }, []);

  const handleGenerateQrCode = async () => {
    setQrError('');
    setQrLoading(true);
    try {
      const dataUrl = await QRCode.toDataURL(baseUrl, {
        width: 320,
        margin: 2,
      });
      setQrDataUrl(dataUrl);
    } catch (err) {
      setQrError('QR-code genereren mislukt');
    } finally {
      setQrLoading(false);
    }
  };

  const handlePrintQrCode = () => {
    if (!qrDataUrl) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html><html><head><title>QR-code printen</title><style>body{margin:0;padding:16px;display:flex;justify-content:center;align-items:center;height:100vh;background:#fff}img{max-width:100%;height:auto;}</style></head><body><img src="${qrDataUrl}" alt="QR code" /></body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  if (loading) {
    return <p>Dashboard laden...</p>;
  }

  if (error) {
    return <p className="text-destructive">{error}</p>;
  }

  return (
    <section className="space-y-4">
      <p className="roc-kicker text-primary">beheer</p>
      <h1 className="roc-title">dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>routes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-primary">{stats.routes}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>locaties</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-primary">{stats.locations}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>gebouwen</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-primary">{stats.buildings}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Site QR-code</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Genereer een QR-code voor de basis-URL van de site:</p>
          <div className="flex flex-wrap gap-2">
            <Button className="px-4" onClick={handleGenerateQrCode} disabled={qrLoading}>
              {qrLoading ? 'Genereren...' : 'Genereer QR-code'}
            </Button>
            <Button
              variant="outline"
              onClick={handlePrintQrCode}
              disabled={!qrDataUrl}
            >
              Printen
            </Button>
            {qrDataUrl && (
              <a
                href={qrDataUrl}
                download="site-qr-code.png"
                className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Opslaan
              </a>
            )}
          </div>
          <p className="text-sm text-muted-foreground break-all">{baseUrl}</p>
          {qrError && <p className="text-destructive">{qrError}</p>}
          {qrDataUrl && (
            <div className="rounded-md border border-slate-200 p-4 inline-block bg-white">
              <img src={qrDataUrl} alt="QR code" className="h-64 w-64" />
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
