import { useState, FormEvent } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { authAPI } from '../services/api';

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError('Vul een geldig e-mailadres en wachtwoord in.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    const { data, error } = await authAPI.login({ email, password });
    setIsSubmitting(false);

    if (error) {
      setError(error);
      return;
    }

    if (!data?.token) {
      setError('Onverwacht antwoord van de server.');
      return;
    }

    onLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <Card className="w-full max-w-md border-gray-200/80 bg-white/95 shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-semibold">Inloggen</CardTitle>
          <CardDescription>
            Verbind met een ASP.NET MVC auth-controller via de nieuwe endpoint.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <CardContent className="space-y-5">
            {error ? (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </p>
            ) : null}

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="login-email">E-mailadres</Label>
                <Input
                  id="login-email"
                  type="email"
                  value={email}
                  placeholder="naam@voorbeeld.nl"
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="login-password">Wachtwoord</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={password}
                  placeholder="Wachtwoord"
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 px-6 pb-6 pt-0">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Bezig...' : 'Inloggen'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Deze login gebruikt nu een ASP.NET MVC auth endpoint als backend.
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
