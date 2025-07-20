// src/pages/UpgradePage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Cpu, ListMusic, ArrowLeft } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const UpgradePage: React.FC = () => {
  const proFeatures = [
    {
      icon: Star,
      title: 'Schede Illimitate',
      description: 'Crea e salva tutti i piani di allenamento che desideri, senza limiti.',
    },
    {
      icon: Cpu,
      title: 'Generazione Schede con AI',
      description: 'Fatti creare un piano di allenamento personalizzato dalla nostra intelligenza artificiale.',
    },
    {
      icon: ListMusic,
      title: 'Suggerimenti Musicali AI',
      description: 'Ricevi playlist generate dall\'AI per darti la carica durante ogni workout.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4">
      <div className="container mx-auto max-w-2xl">
        <header className="text-center my-8">
          <div className="inline-block p-4 bg-yellow-400/20 text-yellow-400 rounded-full mb-4">
            <Star className="h-10 w-10" />
          </div>
          <h1 className="text-4xl font-extrabold">Passa a Gym Companion Pro</h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 mt-2">
            Sblocca il tuo potenziale con le nostre funzionalità avanzate.
          </p>
        </header>

        <main className="space-y-4">
          {proFeatures.map((feature, index) => (
            <Card key={index} className="flex items-start gap-4 p-6">
              <div className="flex-shrink-0 text-yellow-500">
                <feature.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            </Card>
          ))}
        </main>

        <footer className="mt-8 text-center">
          <Button 
            onClick={() => alert('Logica di pagamento da implementare!')} 
            className="w-full max-w-md mx-auto text-lg py-4"
          >
            Upgrade a Pro
          </Button>
          <Link to="/" className="mt-6 inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <ArrowLeft size={16} />
            Torna all'app
          </Link>
        </footer>
      </div>
    </div>
  );
};