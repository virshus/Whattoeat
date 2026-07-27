import React, { useState, useMemo } from 'react';
import { Recipe } from '../types';
import { Search, Plus } from 'lucide-react';
import { RecipeCard } from './RecipeCard';
import { EmptyState } from './EmptyState';
import { getEmptyRecipesCopy, hasRecipes } from '../utils/selectors';

const allTags = ['Favoritos', 'Vegetariano', 'Rápido', 'Saludable', 'Proteína', 'Keto'];

interface RecipeSelectorProps {
  recipes: Recipe[];
  onSelect: (recipe: Recipe) => void;
  onToggleFavorite?: (id: string) => void;
  onAddRecipe?: () => void;
}

export function RecipeSelector({ recipes, onSelect, onToggleFavorite, onAddRecipe }: RecipeSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const emptyCopy = getEmptyRecipesCopy();

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => {
        if (tag === 'Favoritos') return recipe.isFavorite;
        return recipe.tags?.some(rTag => rTag.label === tag) ?? false;
      });
      return matchesSearch && matchesTags;
    });
  }, [recipes, searchQuery, selectedTags]);

  if (!hasRecipes(recipes)) {
    return (
      <EmptyState
        icon={Plus}
        title="Cargá recetas primero"
        description="Necesitás al menos una receta para planificar comidas."
        actionLabel={emptyCopy.actionLabel}
        onAction={onAddRecipe}
        variant="compact"
      />
    );
  }

  return (
    <div className="w-full">
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-ink-soft">
          <Search size={18} strokeWidth={2.5} />
        </div>
        <input 
          type="text" 
          placeholder="Buscar recetas..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-surface border-none radius-card py-3 pl-11 pr-4 text-ink text-body font-medium placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 -mx-4 md:-mx-6 page-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`px-3 py-1.5 rounded-full text-small font-semibold whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              selectedTags.includes(tag) 
                ? 'bg-primary text-white shadow-sm' 
                : 'bg-surface text-ink-soft border border-border hover:border-primary/30'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="stack-cards mt-2">
        {filteredRecipes.length > 0 ? (
          filteredRecipes.map(recipe => (
            <div 
              key={recipe.id} 
              onClick={() => onSelect(recipe)} 
              className="text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary radius-card transition-transform active:scale-[0.98]"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(recipe);
                }
              }}
            >
              <RecipeCard recipe={recipe} onToggleFavorite={onToggleFavorite} />
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-ink-soft">
            <p className="section-title">No se encontraron recetas</p>
            <p className="text-small mt-1">Prueba con otros términos o filtros</p>
          </div>
        )}
      </div>
    </div>
  );
}
