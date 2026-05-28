import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../app/components/ui/card';
import { Input } from '../app/components/ui/input';
import { Label } from '../app/components/ui/label';
import { Alert, AlertDescription } from '../app/components/ui/alert';
import { api } from '../services/api';

function getApiErrorMessage(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return 'Wachtwoord wijzigen is mislukt.';
  }

  const response = (error as { response?: { data?: Record<string, unknown> } }).response;
  const message = response?.data?.message ?? response?.data?.error;
  return typeof message === 'string' ? message : 'Wachtwoord wijzigen is mislukt.';
}

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryEmail = searchParams.get('email')?.trim() ?? '';
  const sessionEmail = sessionStorage.getItem('adminEmail')?.trim() ?? '';
  const email = useMemo(() => queryEmail || sessionEmail, [queryEmail, sessionEmail]);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (email) {
      sessionStorage.setItem('adminEmail', email);
    }
  }, [email]);

  useEffect(() => {
    if (!success) {
      return;
    }

    const timeout = window.setTimeout(() => {
      sessionStorage.removeItem('adminEmail');
      navigate('/admin', { replace: true });
    }, 2000);

    return () => window.clearTimeout(timeout);
  }, [navigate, success]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!newPassword || !confirmPassword) {
      setError('Vul beide wachtwoordvelden in.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Wachtwoord moet minimaal 8 tekens bevatten.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Wachtwoorden komen niet overeen.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/api/admin/force-password-change', {
        email,
        newPassword,
      });
      setSuccess(true);
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-57px)] w-full max-w-md items-center px-4 py-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Wachtwoord wijzigen</CardTitle>
          <CardDescription>
            Eerste login gedetecteerd. Stel een nieuw wachtwoord in voor {email}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <Alert>
              <CheckCircle2 className="text-green-600" />
              <AlertDescription>
                Wachtwoord succesvol gewijzigd. Je wordt doorgestuurd naar het dashboard.
              </AlertDescription>
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
                <Label htmlFor="reset-email">E-mail</Label>
                <Input id="reset-email" type="email" value={email} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">Nieuw wachtwoord</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  minLength={8}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Bevestig wachtwoord</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  minLength={8}
                  required
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Bezig...' : 'Wachtwoord opslaan'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
