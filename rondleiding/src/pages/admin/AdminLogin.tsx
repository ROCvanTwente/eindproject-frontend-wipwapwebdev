import { FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Button } from '../../app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../app/components/ui/card';
import { Input } from '../../app/components/ui/input';
import { Label } from '../../app/components/ui/label';
import { useAuth } from '../../context/AuthContext';

export function AdminLogin() {
  const navigate = useNavigate();
  const { login, isAuthenticated, requiresPasswordChange } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to={requiresPasswordChange ? '/reset-password' : '/admin'} replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loginResult = await login(identifier, password);

      if (loginResult.requiresAccountSetup) {
        navigate('/admin/activate', { replace: true });
        return;
      }

      if (loginResult.requiresPasswordChange) {
        const adminEmail = loginResult.email ?? identifier.trim();
        sessionStorage.setItem('adminEmail', adminEmail);
        toast.info('Wijzig eerst je wachtwoord om door te gaan');
        navigate('/reset-password', { replace: true });
        return;
      }

      toast.success('Succesvol ingelogd');
      navigate('/admin', { replace: true });
    } catch (err) {
      const responseData = (err as { response?: { data?: Record<string, unknown> } })?.response?.data;
      if (responseData?.requiresAccountSetup === true) {
        const pendingEmail = typeof responseData.email === 'string' ? responseData.email : identifier.trim();
        sessionStorage.setItem('pendingAdminEmail', pendingEmail);
        toast.info('Voltooi eerst je eerste login om toegang te krijgen');
        navigate('/admin/activate', { replace: true });
        return;
      }

      setError(err instanceof Error ? err.message : 'Inloggen mislukt');
      toast.error('Inloggen mislukt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-md items-center px-4 py-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Admin login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error ? <p className="bg-destructive/10 p-2 text-sm text-destructive">{error}</p> : null}
            <div className="space-y-2">
              <Label htmlFor="identifier">E-mail of gebruikersnaam</Label>
              <Input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Wachtwoord</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'bezig...' : 'inloggen'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Eerste keer als admin? <Link to="/admin/activate" className="font-semibold text-primary underline-offset-4 hover:underline">Activeer je account</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
