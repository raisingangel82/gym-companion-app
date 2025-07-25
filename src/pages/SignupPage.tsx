import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { auth } from '../services/firebase';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Button } from '../components/ui/Button';

export const SignupPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signUp, user } = useAuth(); // Aggiunto 'user'
  const { activeTheme } = useTheme();
  const navigate = useNavigate();

  // NUOVO: Questo hook reagisce al cambio di stato dell'utente
  useEffect(() => {
    // Se l'utente è loggato (dopo la registrazione), naviga alla home.
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Le password non coincidono.');
    }
    setError('');
    setIsLoading(true);
    try {
      await signUp(auth, email, password);
      // La navigazione non avviene più qui, ma nell'useEffect
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Questo indirizzo email è già in uso.');
      } else {
        setError('Errore durante la registrazione. Riprova.');
      }
      console.error(err);
      setIsLoading(false); // Ferma il loading solo in caso di errore
    }
  };

  return (
    <AuthLayout title="Crea un nuovo account">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="email">Indirizzo Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="confirm-password">Conferma Password</Label>
          <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        </div>
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        <div>
          <Button type="submit" className={`w-full text-white ${activeTheme.bgClass} hover:opacity-90`} disabled={isLoading}>
            {isLoading ? 'Creazione account...' : 'Registrati'}
          </Button>
        </div>
      </form>
      <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
        Hai già un account?{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Accedi
        </Link>
      </p>
    </AuthLayout>
  );
};