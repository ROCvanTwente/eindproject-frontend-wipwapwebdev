import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '../../app/components/ui/alert';
import { Button } from '../../app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../app/components/ui/card';
import { Input } from '../../app/components/ui/input';
import { Label } from '../../app/components/ui/label';
import { api } from '../../services/api';

function getApiErrorMessage(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return 'Activeren is mislukt.';
  }

  const response = (error as { response?: { data?: Record<string, unknown> } }).response;
  const message = response?.data?.message ?? response?.data?.error;
  return typeof message === 'string' ? message : 'Activeren is mislukt.';
}

export function AdminActivate() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(sessionStorage.getItem('pendingAdminEmail') ?? '');
  const [activationCode, setActivationCode] = useState('');
  const [userName, setUserName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Wachtwoorden komen niet overeen.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/api/auth/complete-first-login', {
        email,
        activationCode,
        userName,
        newPassword,
      });
      sessionStorage.removeItem('pendingAdminEmail');
      setSuccess(true);
      window.setTimeout(() => navigate('/admin/login', { replace: true }), 1500);
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-lg items-center px-4 py-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Activeer admin-account</CardTitle>
          <CardDescription>
            Rond je eerste login af met je e-mail, activatiecode, gekozen gebruikersnaam en een veilig wachtwoord.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <Alert>
              <CheckCircle2 className="text-green-600" />
              <AlertDescription>Je account is geactiveerd. Je wordt doorgestuurd naar de loginpagina.</AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error ? (
                <Alert variant="destructive">
                  <AlertCircle />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="activation-email">E-mail</Label>
                <Input id="activation-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="activation-code">Activatiecode</Label>
                <Input id="activation-code" type="text" inputMode="numeric" value={activationCode} onChange={(event) => setActivationCode(event.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="activation-username">Gebruikersnaam</Label>
                <Input id="activation-username" type="text" value={userName} onChange={(event) => setUserName(event.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="activation-password">Wachtwoord</Label>
                <Input id="activation-password" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength={8} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="activation-password-confirm">Bevestig wachtwoord</Label>
                <Input id="activation-password-confirm" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={8} required />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Bezig...' : 'Account activeren'}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Al geactiveerd? <Link to="/admin/login" className="font-semibold text-primary underline-offset-4 hover:underline">Ga naar login</Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
