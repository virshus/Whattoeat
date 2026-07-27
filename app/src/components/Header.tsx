import React from 'react';
import { Menu, ChevronLeft } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  user: User;
  onOpenMenu: () => void;
  currentView?: string;
  onBack?: () => void;
  householdMemberCount?: number;
  shareName?: string;
}

const viewTitles: Record<string, string> = {
  weekly: 'Menú semanal',
  recipes: 'Recetas',
  shopping: 'Lista de compras',
  profile: 'Perfil'
};

export function Header({
  user,
  onOpenMenu,
  currentView = 'home',
  onBack,
  householdMemberCount = 1,
  shareName,
}: HeaderProps) {
  const showHouseholdHint = currentView === 'home' && householdMemberCount > 1;

  return (
    <header className="flex items-center justify-between page-x py-3 mb-1">
      <div className="flex items-center gap-3 min-w-0">
        {currentView !== 'home' && (
          <button
            onClick={onBack}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-ink hover:text-primary transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-95 shrink-0"
            aria-label="Volver"
          >
            <ChevronLeft size={22} strokeWidth={2.5} className="-ml-0.5" />
          </button>
        )}
        {currentView === 'home' ? (
          <div className="min-w-0">
            <h1 className="text-primary-dark font-display font-semibold text-h2 truncate">
              Hola, {user.name}
            </h1>
            {showHouseholdHint && (
              <p className="text-caption text-ink-soft font-medium mt-0.5 truncate">
                {shareName ? `${shareName} · ${householdMemberCount} personas` : `${householdMemberCount} personas`}
              </p>
            )}
          </div>
        ) : (
          <h1 className="page-title text-h2">
            {viewTitles[currentView] || ''}
          </h1>
        )}
      </div>
      <button 
        onClick={onOpenMenu}
        className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-ink hover:text-primary transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-95 shrink-0"
        aria-label="Abrir menú"
      >
        <Menu size={20} strokeWidth={2.5} />
      </button>
    </header>
  );
}
