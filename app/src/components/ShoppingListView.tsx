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
  const categories: IngredientCategory[] = ['Supermercado', 'Verdulería', 'Carnicería', 'Otros'];
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    categories.reduce((acc, cat) => ({ ...acc, [cat]: true }), {})
  );
  const [newItems, setNewItems] = useState<Record<string, string>>({});

  const emptyCopy = getEmptyShoppingCopy();
  const allDoneCopy = getShoppingAllDoneCopy();

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

  if (isShoppingFullyEmpty(items)) {
    return (
      <div className="page-x py-2">
        <EmptyState
          icon={ShoppingCart}
          title={emptyCopy.title}
          description={emptyCopy.description}
          actionLabel={emptyCopy.actionLabel}
          onAction={onGoToWeekly}
        />
      </div>
    );
  }

  if (isShoppingAllDone(items)) {
    return (
      <div className="page-x py-2">
        <EmptyState
          icon={Check}
          title={allDoneCopy.title}
          description={allDoneCopy.description}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 page-x py-2">
      {categories.map((category) => {
        const categoryItems = items.filter((item) => item.category === category);
        if (categoryItems.length === 0) {
          return null;
        }

        const pendingItems = categoryItems.filter((i) => !i.isChecked);
        const completedItems = categoryItems.filter((i) => i.isChecked);
        const isOpen = openCategories[category];

        return (
          <div key={category} className="bg-white radius-card shadow-card overflow-hidden">
            <button
              onClick={() => toggleCategory(category)}
              className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
            >
              <h3 className="section-title">{category}</h3>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-ink-soft"
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
                    <ul className="flex flex-col">
                      {pendingItems.map((item) => (
                        <li
                          key={item.id}
                          className="flex items-center gap-3 py-2 border-b border-surface last:border-0 group"
                        >
                          <button
                            onClick={() => onToggleItem(item.id)}
                            className="w-6 h-6 shrink-0 rounded-full border-2 border-ink-soft/30 flex items-center justify-center group-hover:border-primary transition-colors focus:outline-none"
                          />
                          <div className="flex flex-1 justify-between items-center gap-2">
                            <span className="text-ink text-body font-medium leading-tight">{item.name}</span>
                            {item.quantity && (
                              <span className="text-ink-soft text-small text-right shrink-0">
                                {item.quantity}
                              </span>
                            )}
                          </div>
                          {item.isCustom && onDeleteCustomItem && (
                            <button
                              onClick={() => onDeleteCustomItem(item.id)}
                              className="text-ink-soft/50 hover:text-danger focus:outline-none shrink-0"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>

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
                                onClick={() => onToggleItem(item.id)}
                                className="w-6 h-6 shrink-0 rounded-full bg-primary flex items-center justify-center text-white focus:outline-none"
                              >
                                <Check size={14} strokeWidth={3} />
                              </button>
                              <div className="flex flex-1 justify-between items-center gap-2 line-through">
                                <span className="text-ink text-body font-medium leading-tight">
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
