import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext'; // Importa il tema
import { auth } from '../services/firebase';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Button } from '../components/ui/Button';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn, signInWithGoogle } = useAuth();
  const { activeTheme } = useTheme(); // Usa il tema per i colori
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await signIn(auth, email, password);
      navigate('/');
    } catch (err: any) {
      setError('Credenziali non valide. Riprova.');
      console.error(err);
    }
    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (err: any) {
      setError('Impossibile accedere con Google.');
      console.error(err);
    }
    setIsLoading(false);
  };

  return (
    <AuthLayout title="Accedi al tuo account">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="email">Indirizzo Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        <div>
          {/* BOTTONE CON COLORE DEL TEMA */}
          <Button 
            type="submit" 
            className={`w-full text-white ${activeTheme.bgClass} hover:opacity-90`} 
            disabled={isLoading}
          >
            {isLoading ? 'Accesso in corso...' : 'Accedi'}
          </Button>
        </div>
      </form>
      <div className="my-6 flex items-center">
        <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
        <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-400 text-sm">Oppure</span>
        <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
      </div>
      <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
        Accedi con Google
      </Button>
      <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
        Non hai un account?{' '}
        <Link to="/signup" className="font-medium text-primary hover:underline">
          Registrati
        </Link>
      </p>
    </AuthLayout>
  );
};