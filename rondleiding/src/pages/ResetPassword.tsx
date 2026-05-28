import { FormEvent, useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router';
import { AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import { Button } from '../app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../app/components/ui/card';
import { Input } from '../app/components/ui/input';
import { Label } from '../app/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '../app/components/ui/alert';
import { api, TOKEN_STORAGE_KEY } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { decodeJwt, getPasswordChangeRequirement } from '../utils/jwtUtils';

const POST_RESET_REDIRECT_DELAY_MS = 2000;

export function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  const decoded = token ? decodeJwt(token) : null;

  const emailFromUrl = new URLSearchParams(location.search).get('email');
  const emailFromToken = typeof decoded?.sub === 'string' ? decoded.sub : decoded?.email;
  const email = emailFromToken || emailFromUrl || '';

  useEffect(() => {
    if (!token) {
      navigate('/admin/login', { replace: true });
      return;
    }

    if (!getPasswordChangeRequirement(token)) {
      navigate('/admin', { replace: true });
    }
  }, [navigate, token]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Wachtwoord moet minimaal 8 tekens bevatten.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Wachtwoorden komen niet overeen.');
      return;
    }

    if (!token) {
      setError('Geen geldig token gevonden. Log opnieuw in.');
      return;
    }

    if (!email) {
      setError('Kon geen e-mailadres vinden in het token.');
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post(
        '/api/admin/force-password-change',
        {
          email,
          newPassword: password,
        },
      );

      setIsSuccess(true);
      setTimeout(() => {
        logout();
        navigate('/admin/login', { replace: true });
      }, POST_RESET_REDIRECT_DELAY_MS);
    } catch (submitError) {
      const apiError =
        axios.isAxiosError(submitError) && typeof submitError.response?.data?.message === 'string'
          ? submitError.response.data.message
          : null;
      setError(apiError ?? 'Wachtwoord wijzigen is mislukt. Probeer het opnieuw.');
      console.error(submitError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-57px)] w-full max-w-md items-center px-4 py-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Wachtwoord wijzigen
          </CardTitle>
          <CardDescription>Stel een nieuw wachtwoord in om verder te gaan naar het dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-muted-foreground">Ingelogd als: {email || 'onbekend'}</p>

            {error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Fout</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            {isSuccess ? (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Gelukt</AlertTitle>
                <AlertDescription>Wachtwoord aangepast. Je wordt doorgestuurd naar de loginpagina.</AlertDescription>
              </Alert>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="new-password">Nieuw wachtwoord</Label>
              <Input
                id="new-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                required
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
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting || isSuccess}>
              {isSubmitting ? 'Bezig...' : 'Wachtwoord wijzigen'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
