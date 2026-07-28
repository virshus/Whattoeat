import React, { useState, useMemo } from 'react';
import { Recipe } from '../types';
import { Search, Plus } from 'lucide-react';
import { RecipeGridCard } from './RecipeGridCard';
import { EmptyState } from './EmptyState';
import { getEmptyRecipesCopy, hasRecipes, sortRecipesForDisplay } from '../utils/selectors';

interface RecipesViewProps {
  recipes: Recipe[];
  filterTags?: string[];
  onSelect: (recipe: Recipe) => void;
  onToggleFavorite: (id: string) => void;
  onAddRecipe: () => void;
}

export function RecipesView({
  recipes,
  filterTags,
  onSelect,
  onToggleFavorite,
  onAddRecipe,
}: RecipesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const emptyCopy = getEmptyRecipesCopy();
  const allTags = filterTags?.length
    ? filterTags
    : ['Favoritos', 'Vegetariano', 'Rápido', 'Saludable', 'Proteína'];

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const filteredRecipes = useMemo(() => {
    const filtered = recipes.filter(recipe => {
      const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => {
        if (tag === 'Favoritos') return recipe.isFavorite;
        return recipe.tags?.some(rTag => rTag.label.toLowerCase() === tag.toLowerCase()) ?? false;
      });
      return matchesSearch && matchesTags;
    });
    return sortRecipesForDisplay(filtered);
  }, [recipes, searchQuery, selectedTags]);

  return (
    <div className="flex flex-col h-full">
      <div className="page-x pt-1 pb-3 sticky top-0 bg-canvas z-20">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-ink-soft">
              <Search size={18} strokeWidth={2.5} />
            </div>
            <input 
              type="text" 
              placeholder="Buscar recetas..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-none radius-card py-3 pl-11 pr-4 text-ink text-body font-medium placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            />
          </div>
          
          <button 
            onClick={onAddRecipe}
            className="w-11 h-11 shrink-0 bg-primary text-white radius-card flex items-center justify-center shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas active:scale-95 transition-transform"
            aria-label="Agregar receta"
          >
            <Plus size={22} strokeWidth={2.5} />
          </button>
        </div>

        {hasRecipes(recipes) && (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 md:-mx-6 page-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1.5 rounded-full text-small font-semibold whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  selectedTags.includes(tag) 
                    ? 'bg-primary text-white shadow-sm' 
                    : 'bg-white text-ink-soft border border-border hover:border-primary/30'
                }`}
              >
                {tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="page-x pb-16">
        {!hasRecipes(recipes) ? (
          <EmptyState
            icon={Plus}
            title={emptyCopy.title}
            description={emptyCopy.description}
            actionLabel={emptyCopy.actionLabel}
            onAction={onAddRecipe}
          />
        ) : filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredRecipes.map(recipe => (
              <RecipeGridCard 
                key={recipe.id} 
                recipe={recipe} 
                onToggleFavorite={onToggleFavorite} 
                onClick={onSelect}
              />
            ))}
          </div>
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
