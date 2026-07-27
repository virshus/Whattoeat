import React, { useState } from 'react';
import { WeekPlan } from '../types';
import { Plus, Clock, CalendarDays, Trash2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EmptyState } from './EmptyState';
import { getEmptyWeekCopy, isWeekEmpty } from '../utils/selectors';

interface WeeklyPlanViewProps {
  plan: WeekPlan;
  hasRecipes?: boolean;
  onPlanMeal?: (dayIndex: number, slotIndex: number) => void;
  onPlannedMealClick?: (dayIndex: number, slotIndex: number) => void;
  onAddRecipe?: () => void;
  onClearWeek?: () => void;
}

export function WeeklyPlanView({
  plan,
  hasRecipes = true,
  onPlanMeal,
  onPlannedMealClick,
  onAddRecipe,
  onClearWeek,
}: WeeklyPlanViewProps) {
  const weekIsEmpty = isWeekEmpty(plan);
  const emptyCopy = getEmptyWeekCopy(hasRecipes);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleConfirmClear = () => {
    onClearWeek?.();
    setShowClearConfirm(false);
  };

  return (
    <div className="page-x py-3">
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white radius-card p-5 max-w-sm w-full shadow-xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="clear-week-title"
            >
              <div className="w-11 h-11 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-3">
                <AlertTriangle size={22} strokeWidth={2.5} />
              </div>
              <h3 id="clear-week-title" className="section-title mb-2">
                Limpiar menú semanal
              </h3>
              <p className="text-ink-soft text-small mb-5">
                Se van a borrar todas las recetas planificadas de esta semana. Esta acción no se puede
                deshacer.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-3 px-4 radius-pill font-semibold text-ink bg-surface transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmClear}
                  className="flex-1 py-3 px-4 radius-pill font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors"
                >
                  Limpiar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!hasRecipes && (
        <div className="mb-4">
          <EmptyState
            icon={CalendarDays}
            title={emptyCopy.title}
            description={emptyCopy.description}
            actionLabel={emptyCopy.actionLabel}
            onAction={onAddRecipe}
            variant="inCard"
          />
        </div>
      )}

      {hasRecipes && weekIsEmpty && (
        <div className="mb-4">
          <EmptyState
            icon={CalendarDays}
            title="Ninguna comida planificada esta semana"
            description={emptyCopy.description}
            actionLabel="Planificar primera comida"
            onAction={() => onPlanMeal?.(0, 0)}
            variant="inCard"
          />
        </div>
      )}

      <div className="flex flex-col">
        {plan.days.map((day, index) => {
          const isLast = index === plan.days.length - 1;
          const hasMeals = day.slots.some((s) => s.imageUrl);

          return (
            <div key={day.dayName} className="relative flex gap-3 pb-5">
              {!isLast && (
                <div className="absolute left-[19px] top-10 bottom-0 w-[2px] bg-border" />
              )}

              <div
                className={`w-10 h-10 rounded-full border-[2px] flex items-center justify-center font-semibold text-small shrink-0 bg-canvas relative z-10 ${
                  hasMeals ? 'border-primary text-primary' : 'border-border text-ink-soft'
                }`}
              >
                {day.shortName}
              </div>

              <div className="flex-1 flex flex-col gap-2.5">
                {day.slots.map((slot, idx) =>
                  slot.imageUrl ? (
                    <button
                      key={idx}
                      onClick={() => onPlannedMealClick?.(index, idx)}
                      className="bg-surface radius-card p-3 shadow-card flex gap-3 items-center w-full text-left active:scale-[0.98] transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <img
                        src={slot.imageUrl}
                        alt={slot.recipeTitle}
                        className="w-11 h-11 radius-input object-cover shrink-0"
                      />
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-caption font-semibold text-ink-soft">{slot.type}</span>
                          {slot.prepTime && (
                            <div className="flex items-center text-ink-soft text-caption font-medium gap-1 shrink-0 ml-2">
                              <Clock size={12} strokeWidth={2} />
                              <span>{slot.prepTime}</span>
                            </div>
                          )}
                        </div>
                        <span className="font-display font-semibold text-body text-ink leading-tight truncate">
                          {slot.recipeTitle}
                        </span>
                      </div>
                    </button>
                  ) : (
                    <button
                      key={idx}
                      onClick={() => {
                        if (!hasRecipes) {
                          onAddRecipe?.();
                          return;
                        }
                        onPlanMeal?.(index, idx);
                      }}
                      className={`w-full border-2 border-dashed radius-card p-3 flex items-center justify-center gap-2 transition-all active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        hasRecipes
                          ? 'border-border text-ink-soft hover:bg-white hover:border-primary/50 hover:text-primary'
                          : 'border-border/60 text-ink-soft/60 cursor-not-allowed'
                      }`}
                      aria-disabled={!hasRecipes}
                    >
                      <Plus size={16} strokeWidth={2.5} />
                      <span className="font-semibold text-small">
                        {hasRecipes
                          ? `Planificar ${slot.type.toLowerCase()}`
                          : 'Cargá recetas para planificar'}
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!weekIsEmpty && (
        <div className="pt-1 pb-2">
          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="w-full flex items-center justify-center gap-2 py-3.5 radius-pill font-semibold text-small text-danger bg-red-50 hover:bg-red-100 active:scale-[0.98] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-danger"
            aria-label="Limpiar menú semanal"
          >
            <Trash2 size={16} strokeWidth={2.5} />
            <span>Limpiar menú</span>
          </button>
        </div>
      )}
    </div>
  );
}
