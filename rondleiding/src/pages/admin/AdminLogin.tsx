import { FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Button } from '../../app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../app/components/ui/card';
import { Input } from '../../app/components/ui/input';
import { Label } from '../../app/components/ui/label';
import { useAuth } from '../../context/AuthContext';
import { getPasswordChangeRequirement } from '../../utils/jwtUtils';

export function AdminLogin() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = await login(email, password);
      if (getPasswordChangeRequirement(token)) {
        toast.info('Wachtwoord wijzigen is vereist');
        navigate('/reset-password', { replace: true });
        return;
      }

      toast.success('Succesvol ingelogd');
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Inloggen mislukt');
      toast.error('Inloggen mislukt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-57px)] w-full max-w-md items-center px-4 py-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Admin login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error ? <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p> : null}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
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
              {loading ? 'Bezig...' : 'Inloggen'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
