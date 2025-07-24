import type { ReactNode } from 'react';
import { Dumbbell } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title }) => {
  const { activeTheme } = useTheme();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Dumbbell className={`mx-auto h-12 w-auto ${activeTheme.textClass}`} />
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            {title}
          </h2>
        </div>
        <div className="bg-white dark:bg-gray-800 p-8 shadow-lg rounded-xl">
          {children}
        </div>
      </div>
    </div>
  );
};