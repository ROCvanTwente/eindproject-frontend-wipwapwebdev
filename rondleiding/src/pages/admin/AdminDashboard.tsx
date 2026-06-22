import { type FormEvent, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Copy, ShieldPlus } from 'lucide-react';
import { Button } from '../../app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../app/components/ui/card';
import { Input } from '../../app/components/ui/input';
import { Label } from '../../app/components/ui/label';
import { toast } from 'sonner';
import { adminService } from '../../services/adminService';
import { buildingService } from '../../services/buildingService';
import { locationService } from '../../services/locationService';
import { routeService } from '../../services/routeService';
import type { AdminInviteResponse, AdminOverview, DashboardStats } from '../../types';

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({ routes: 0, locations: 0, buildings: 0 });
  const [admins, setAdmins] = useState<AdminOverview[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteResult, setInviteResult] = useState<AdminInviteResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState('');
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  useEffect(() => {
    Promise.all([routeService.getAll(), locationService.getAll(), buildingService.getAll(), adminService.getAdmins()])
      .then(([routes, locations, buildings, adminList]) => {
        setStats({ routes: routes.length, locations: locations.length, buildings: buildings.length });
        setAdmins(adminList);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Dashboard laden mislukt'))
      .finally(() => setLoading(false));
  }, []);

  const handleInviteAdmin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setInviteLoading(true);

    try {
      const result = await adminService.inviteAdmin(inviteEmail);
      setInviteResult(result);
      setInviteEmail('');
      setAdmins((current) => [
        ...current,
        {
          id: `pending-${result.email}`,
          email: result.email,
          userName: 'Nog te kiezen',
          roles: ['Admin'],
          requiresAccountSetup: true,
        },
      ]);
      toast.success('Nieuwe admin-uitnodiging aangemaakt');
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message ?? 'Admin aanmaken mislukt');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCopy = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} gekopieerd`);
  };

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
            <Button onClick={handleGenerateQrCode} disabled={qrLoading}>
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

      <Card>
        <CardHeader>
          <CardTitle>Nieuwe admin aanmaken</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleInviteAdmin} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="invite-email">E-mailadres nieuwe admin</Label>
              <Input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                placeholder="nieuwe.admin@school.nl"
                required
              />
            </div>
            <Button type="submit" disabled={inviteLoading}>
              <ShieldPlus className="mr-2 size-4" />
              {inviteLoading ? 'Aanmaken...' : 'Admin-uitnodiging maken'}
            </Button>
          </form>

          {inviteResult ? (
            <div className="space-y-3 rounded-[2mm] border border-primary/20 bg-primary/5 p-4">
              <p className="font-semibold text-primary">Activatiegegevens voor {inviteResult.email}</p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm">Activatiecode: <strong>{inviteResult.activationCode}</strong></span>
                <Button type="button" variant="outline" size="sm" onClick={() => handleCopy(inviteResult.activationCode, 'Activatiecode')}>
                  <Copy className="mr-2 size-4" />
                  Kopieer code
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm">Activatielink: <strong>{`${baseUrl}/admin/activate`}</strong></span>
                <Button type="button" variant="outline" size="sm" onClick={() => handleCopy(`${baseUrl}/admin/activate`, 'Activatielink')}>
                  <Copy className="mr-2 size-4" />
                  Kopieer link
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Geldig tot: {new Date(inviteResult.activationExpiresAt).toLocaleString('nl-NL')}
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Admins</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {admins.map((admin) => (
            <div key={admin.id} className="flex flex-col gap-1 rounded-[2mm] border border-border/70 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">{admin.email}</p>
                <p className="text-sm text-muted-foreground">Gebruikersnaam: {admin.userName}</p>
              </div>
              <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${admin.requiresAccountSetup ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                {admin.requiresAccountSetup ? 'Wacht op eerste login' : 'Actief'}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
