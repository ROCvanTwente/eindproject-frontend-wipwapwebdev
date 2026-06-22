import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { KeyRound } from 'lucide-react';
import { Button } from '../../app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../app/components/ui/card';
import { Input } from '../../app/components/ui/input';
import { Label } from '../../app/components/ui/label';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';

const MIN_PASSWORD_LENGTH = 6;

function getApiErrorMessage(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return 'Wachtwoord wijzigen mislukt';
  }

  const response = (error as { response?: { data?: { message?: unknown; errors?: unknown } } }).response;
  const message = response?.data?.message;
  if (typeof message === 'string') {
    return message;
  }

  return 'Wachtwoord wijzigen mislukt';
}

export function SettingsAdmin() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      toast.error(`Nieuw wachtwoord moet minimaal ${MIN_PASSWORD_LENGTH} tekens bevatten`);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error('Nieuwe wachtwoorden komen niet overeen');
      return;
    }

    setLoading(true);

    try {
      await authService.changePassword({
        currentPassword,
        newPassword,
        confirmNewPassword,
      });

      toast.success('Wachtwoord gewijzigd. Log opnieuw in met je nieuwe wachtwoord.');
      logout();
      navigate('/admin/login', { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <p className="roc-kicker text-primary">beheer</p>
        <h1 className="roc-title">instellingen</h1>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="size-5 text-primary" />
            Wachtwoord wijzigen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Huidig wachtwoord</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                autoComplete="current-password"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="settings-new-password">Nieuw wachtwoord</Label>
              <Input
                id="settings-new-password"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                autoComplete="new-password"
                minLength={MIN_PASSWORD_LENGTH}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">Bevestig nieuw wachtwoord</Label>
              <Input
                id="confirm-new-password"
                type="password"
                value={confirmNewPassword}
                onChange={(event) => setConfirmNewPassword(event.target.value)}
                autoComplete="new-password"
                minLength={MIN_PASSWORD_LENGTH}
                required
                disabled={loading}
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? 'Opslaan...' : 'Wachtwoord opslaan'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
