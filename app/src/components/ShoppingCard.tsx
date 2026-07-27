import React from 'react';
import { ShoppingCart, ChevronRight } from 'lucide-react';

interface ShoppingCardProps {
  ingredientsCount: number;
  isEmpty?: boolean;
  isAllDone?: boolean;
  isSharedHousehold?: boolean;
  onClick?: () => void;
}

export function ShoppingCard({
  ingredientsCount,
  isEmpty = false,
  isAllDone = false,
  isSharedHousehold = false,
  onClick,
}: ShoppingCardProps) {
  const getTitle = () => {
    if (isEmpty) {
      return isSharedHousehold
        ? 'La lista compartida se arma sola cuando planificás'
        : 'Tu lista se arma sola cuando planificás';
    }
    if (isAllDone) return '¡Listo! Compraste todo';
    return isSharedHousehold ? 'Lista compartida' : 'Tu lista se arma sola';
  };

  const getSubtitle = () => {
    if (isEmpty) return 'Todavía no hay ingredientes';
    if (isAllDone) return 'No quedan ingredientes pendientes';
    return `${ingredientsCount} ingredientes listos`;
  };

  const iconWrapperClass = isEmpty
    ? 'bg-canvas text-ink-soft'
    : 'bg-[#E0F5EE] text-success';

  return (
    <div className="page-x section-gap">
      <button
        onClick={onClick}
        className="w-full bg-surface radius-card p-4 shadow-card flex items-center justify-between active:scale-[0.98] transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-primary group"
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconWrapperClass}`}
          >
            <ShoppingCart size={20} strokeWidth={2.5} />
          </div>
          <div className="text-left">
            <h3 className="section-title mb-0.5">
              {getTitle()}
            </h3>
            <p className="text-ink-soft text-small font-medium">{getSubtitle()}</p>
          </div>
        </div>
        <div className="text-ink-soft/50 group-hover:text-ink-soft transition-colors shrink-0">
          <ChevronRight size={20} strokeWidth={2.5} />
        </div>
      </button>
    </div>
  );
}
