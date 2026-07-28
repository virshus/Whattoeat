import React, { useState } from 'react';
import { ShoppingItem, IngredientCategory } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Plus, Check, Trash2, ShoppingCart } from 'lucide-react';
import { EmptyState } from './EmptyState';
import {
  getEmptyShoppingCopy,
  getShoppingAllDoneCopy,
  isShoppingAllDone,
  isShoppingFullyEmpty,
} from '../utils/selectors';

/** Product sections — always visible in the shopping list UI. */
const PRODUCT_CATEGORIES: IngredientCategory[] = [
  'Supermercado',
  'Verdulería',
  'Carnicería',
  'Pescadería',
];

interface ShoppingListViewProps {
  items: ShoppingItem[];
  onToggleItem: (id: string) => void;
  onAddItem: (category: IngredientCategory, name: string) => void;
  onDeleteCustomItem?: (id: string) => void;
  onGoToWeekly?: () => void;
}

export function ShoppingListView({
  items,
  onToggleItem,
  onAddItem,
  onDeleteCustomItem,
  onGoToWeekly,
}: ShoppingListViewProps) {
  const otrosItems = items.filter((item) => item.category === 'Otros');
  const categories: IngredientCategory[] =
    otrosItems.length > 0 ? [...PRODUCT_CATEGORIES, 'Otros'] : PRODUCT_CATEGORIES;

  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    () =>
      [...PRODUCT_CATEGORIES, 'Otros'].reduce<Record<string, boolean>>(
        (acc, cat) => ({ ...acc, [cat]: true }),
        {}
      )
  );
  const [newItems, setNewItems] = useState<Record<string, string>>({});

  const emptyCopy = getEmptyShoppingCopy();
  const allDoneCopy = getShoppingAllDoneCopy();
  const fullyEmpty = isShoppingFullyEmpty(items);
  const allDone = isShoppingAllDone(items);

  const toggleCategory = (category: string) => {
    setOpenCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const handleAddItem = (e: React.FormEvent, category: IngredientCategory) => {
    e.preventDefault();
    const val = newItems[category]?.trim();
    if (val) {
      onAddItem(category, val);
      setNewItems((prev) => ({ ...prev, [category]: '' }));
    }
  };

  return (
    <div className="flex flex-col gap-3 page-x py-2">
      {fullyEmpty && (
        <EmptyState
          icon={ShoppingCart}
          title={emptyCopy.title}
          description={emptyCopy.description}
          actionLabel={emptyCopy.actionLabel}
          onAction={onGoToWeekly}
          variant="inCard"
        />
      )}

      {!fullyEmpty && allDone && (
        <EmptyState
          icon={Check}
          title={allDoneCopy.title}
          description={allDoneCopy.description}
          variant="inCard"
        />
      )}

      {categories.map((category) => {
        const categoryItems = items.filter((item) => item.category === category);
        const count = categoryItems.length;
        const pendingItems = categoryItems.filter((i) => !i.isChecked);
        const completedItems = categoryItems.filter((i) => i.isChecked);
        const isOpen = openCategories[category];

        return (
          <div key={category} className="bg-white radius-card shadow-card overflow-hidden">
            <button
              type="button"
              onClick={() => toggleCategory(category)}
              className="w-full flex items-center justify-between gap-3 p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
              aria-expanded={isOpen}
            >
              <div className="flex items-center gap-2 min-w-0">
                <h3 className="section-title truncate">{category}</h3>
                <span
                  className="shrink-0 text-caption font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary tabular-nums"
                  aria-label={`${count} ${count === 1 ? 'ingrediente' : 'ingredientes'}`}
                >
                  {count}
                </span>
              </div>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-ink-soft shrink-0"
              >
                <ChevronDown size={18} />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4">
                    {pendingItems.length > 0 ? (
                      <ul className="flex flex-col">
                        {pendingItems.map((item) => (
                          <li
                            key={item.id}
                            className="flex items-center gap-3 py-2 border-b border-surface last:border-0 group"
                          >
                            <button
                              type="button"
                              onClick={() => onToggleItem(item.id)}
                              className="w-6 h-6 shrink-0 rounded-full border-2 border-ink-soft/30 flex items-center justify-center group-hover:border-primary transition-colors focus:outline-none"
                            />
                            <div className="flex flex-1 justify-between items-center gap-2 min-w-0">
                              <span className="text-ink text-body font-medium leading-tight truncate">
                                {item.name}
                              </span>
                              {item.quantity && (
                                <span className="text-ink-soft text-small text-right shrink-0">
                                  {item.quantity}
                                </span>
                              )}
                            </div>
                            {item.isCustom && onDeleteCustomItem && (
                              <button
                                type="button"
                                onClick={() => onDeleteCustomItem(item.id)}
                                className="text-ink-soft/50 hover:text-danger focus:outline-none shrink-0"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : completedItems.length === 0 ? (
                      <p className="text-small text-ink-soft py-1">
                        No hay ingredientes en esta sección.
                      </p>
                    ) : null}

                    <form
                      onSubmit={(e) => handleAddItem(e, category)}
                      className="mt-2 flex items-center gap-2"
                    >
                      <input
                        type="text"
                        placeholder="Agregar ingrediente..."
                        value={newItems[category] || ''}
                        onChange={(e) =>
                          setNewItems((prev) => ({ ...prev, [category]: e.target.value }))
                        }
                        className="flex-1 bg-surface radius-input px-3 py-2.5 text-small focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      <button
                        type="submit"
                        disabled={!newItems[category]?.trim()}
                        className="w-10 h-10 shrink-0 bg-primary text-white radius-input flex items-center justify-center disabled:opacity-50 transition-opacity focus:outline-none"
                      >
                        <Plus size={18} />
                      </button>
                    </form>

                    {completedItems.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-caption font-semibold text-ink-soft uppercase tracking-wider mb-2">
                          Completados
                        </h4>
                        <ul className="flex flex-col">
                          {completedItems.map((item) => (
                            <li
                              key={item.id}
                              className="flex items-center gap-3 py-2 opacity-50 group"
                            >
                              <button
                                type="button"
                                onClick={() => onToggleItem(item.id)}
                                className="w-6 h-6 shrink-0 rounded-full bg-primary flex items-center justify-center text-white focus:outline-none"
                              >
                                <Check size={14} strokeWidth={3} />
                              </button>
                              <div className="flex flex-1 justify-between items-center gap-2 line-through min-w-0">
                                <span className="text-ink text-body font-medium leading-tight truncate">
                                  {item.name}
                                </span>
                                {item.quantity && (
                                  <span className="text-ink-soft text-small text-right shrink-0">
                                    {item.quantity}
                                  </span>
                                )}
                              </div>
                              {item.isCustom && onDeleteCustomItem && (
                                <button
                                  type="button"
                                  onClick={() => onDeleteCustomItem(item.id)}
                                  className="text-ink-soft/50 hover:text-danger focus:outline-none shrink-0"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
