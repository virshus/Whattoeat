import React from 'react';
import { Heart, Clock } from 'lucide-react';
import { Recipe, Tag } from '../types';

interface RecipeGridCardProps {
  recipe: Recipe;
  onToggleFavorite?: (id: string) => void;
  onClick?: (recipe: Recipe) => void;
}

const tagColorMap: Record<Tag['color'], string> = {
  mint: 'bg-[#D9F2ED] text-[#008F84]',
  violet: 'bg-[#F0E5FF] text-[#7A00C7]',
  orange: 'bg-[#FFEDD5] text-[#C2410C]',
  lilac: 'bg-[#F0E5FF] text-[#7A00C7]',
};

export function RecipeGridCard({ recipe, onToggleFavorite, onClick }: RecipeGridCardProps) {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(recipe.id);
    }
  };

  return (
    <div 
      onClick={() => onClick && onClick(recipe)}
      className="bg-white radius-card shadow-card overflow-hidden flex flex-col cursor-pointer transition-transform active:scale-[0.98] group relative h-full"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={recipe.imageUrl} 
          alt={recipe.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <button 
          onClick={handleFavoriteClick}
          className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-white shadow-sm text-ink-soft hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-90 z-10"
          aria-label={recipe.isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          <Heart 
            size={14} 
            strokeWidth={2.5}
            className={`transition-colors ${recipe.isFavorite ? 'fill-primary text-primary' : 'text-[#D1D1D1]'}`}
          />
        </button>
      </div>

      <div className="p-2.5 flex flex-col flex-1">
        <div className="flex flex-wrap gap-1 mb-1.5">
          {recipe.tags?.slice(0, 2).map((tag, index) => (
            <span 
              key={index}
              className={`text-caption font-semibold px-1.5 py-0.5 rounded ${tagColorMap[tag.color] || tagColorMap.violet} whitespace-nowrap`}
            >
              {tag.label}
            </span>
          ))}
          {(recipe.tags?.length || 0) > 2 && (
             <span className="text-caption font-semibold px-1.5 py-0.5 rounded bg-surface text-ink-soft whitespace-nowrap">
               +{(recipe.tags?.length || 0) - 2}
             </span>
          )}
        </div>

        <h3 className="font-display font-semibold text-small text-ink leading-tight mb-1.5">
          {recipe.title}
        </h3>
        
        <div className="mt-auto flex items-center text-ink-soft text-caption font-medium gap-1">
          <Clock size={10} strokeWidth={2.5} />
          <span>{recipe.prepTime}</span>
        </div>
      </div>
    </div>
  );
}
