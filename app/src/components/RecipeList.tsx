import React from 'react';
import { Recipe } from '../types';
import { RecipeCard } from './RecipeCard';
import { EmptyState } from './EmptyState';
import { Utensils } from 'lucide-react';
import { getEmptyRecipesCopy, hasRecipes } from '../utils/selectors';

interface RecipeListProps {
  recipes: Recipe[];
  onToggleFavorite?: (id: string) => void;
  onRecipeClick?: (recipe: Recipe) => void;
  onViewAll?: () => void;
  onAddRecipe?: () => void;
}

export function RecipeList({ recipes, onToggleFavorite, onRecipeClick, onViewAll, onAddRecipe }: RecipeListProps) {
  const emptyCopy = getEmptyRecipesCopy();

  return (
    <div className="page-x section-gap">
      <div className="flex items-center justify-between mb-3">
        <h2 className="section-title">
          Tus recetas guardadas
        </h2>
        {hasRecipes(recipes) && (
          <button 
            onClick={onViewAll}
            className="text-primary-dark font-semibold text-small hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
          >
            Ver todas
          </button>
        )}
      </div>
      
      {!hasRecipes(recipes) ? (
        <EmptyState
          icon={Utensils}
          title={emptyCopy.title}
          description={emptyCopy.description}
          actionLabel={emptyCopy.actionLabel}
          onAction={onAddRecipe}
          variant="inCard"
        />
      ) : (
        <div className="stack-cards">
          {recipes.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} onToggleFavorite={onToggleFavorite} onClick={onRecipeClick} />
          ))}
        </div>
      )}
    </div>
  );
}
