import React from 'react';
import { Plus } from 'lucide-react';
import { WeekPlan } from '../types';
import { getEmptyWeekCopy, isWeekEmpty } from '../utils/selectors';

interface WeeklyHighlightProps {
  plan: WeekPlan;
  hasRecipes?: boolean;
  isSharedHousehold?: boolean;
  onCompleteNow?: () => void;
  onAddRecipe?: () => void;
}

export function WeeklyHighlight({
  plan,
  hasRecipes = true,
  isSharedHousehold = false,
  onCompleteNow,
  onAddRecipe,
}: WeeklyHighlightProps) {
  const size = 80;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (plan.progressPercentage / 100) * circumference;
  const weekIsEmpty = isWeekEmpty(plan);
  const emptyCopy = getEmptyWeekCopy(hasRecipes);

  const getButtonLabel = () => {
    if (plan.progressPercentage >= 100) return 'Mostrar menú';
    if (weekIsEmpty) return emptyCopy.actionLabel;
    return 'Completar ahora';
  };

  const handlePrimaryAction = () => {
    if (weekIsEmpty && !hasRecipes) {
      onAddRecipe?.();
      return;
    }
    onCompleteNow?.();
  };

  return (
    <div className="page-x section-gap">
      <div className="bg-primary radius-card p-4 md:p-5 text-white shadow-card relative overflow-hidden">
        
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 pr-4">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-block px-2.5 py-0.5 bg-white/20 rounded-full text-caption font-semibold tracking-wide">
                Esta semana
              </span>
              {isSharedHousehold && (
                <span className="inline-block px-2.5 py-0.5 bg-white/20 rounded-full text-caption font-semibold tracking-wide">
                  Compartido
                </span>
              )}
            </div>
            {weekIsEmpty ? (
              <>
                <h2 className="font-display font-semibold text-h2 leading-tight mb-1.5">
                  {emptyCopy.title}
                </h2>
                <p className="text-white/80 text-small mb-3">{emptyCopy.description}</p>
              </>
            ) : (
              <h2 className="font-display font-semibold text-h2 leading-tight mb-3">
                {plan.completedMeals} de {plan.totalMeals} comidas planificadas
              </h2>
            )}
            <button 
              onClick={handlePrimaryAction}
              className="px-5 py-2 bg-white text-primary radius-pill font-semibold text-small active:scale-95 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-white min-h-[44px]"
            >
              {getButtonLabel()}
            </button>
          </div>
          
          <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90 w-full h-full">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth={strokeWidth}
                fill="none"
              />
              {!weekIsEmpty && (
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="white"
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              )}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-display font-semibold text-display">
              {weekIsEmpty ? '—' : `${plan.progressPercentage}%`}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-start mt-5">
          {plan.days.map((day, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <span className="text-caption font-semibold mb-1.5 uppercase">{day.shortName}</span>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full relative z-10 flex items-center justify-center">
                  {day.slots[0]?.imageUrl ? (
                    <img 
                      src={day.slots[0].imageUrl} 
                      alt=""
                      className="w-full h-full object-cover rounded-full border-[2px] border-primary"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full border-2 border-dashed border-white/40 flex items-center justify-center text-white/60 bg-transparent">
                      <Plus size={14} strokeWidth={2.5} />
                    </div>
                  )}
                </div>
                <div className="w-10 h-10 rounded-full relative -mt-2.5 z-0 flex items-center justify-center">
                  {day.slots[1]?.imageUrl ? (
                    <img 
                      src={day.slots[1].imageUrl} 
                      alt=""
                      className="w-full h-full object-cover rounded-full border-[2px] border-primary"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full border-2 border-dashed border-white/40 flex items-center justify-center text-white/60 bg-transparent">
                      <Plus size={14} strokeWidth={2.5} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
