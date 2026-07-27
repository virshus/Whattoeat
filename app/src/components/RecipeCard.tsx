import React from 'react';
import { Clock, Heart } from 'lucide-react';
import { Recipe, Tag } from '../types';

export interface RecipeCardProps {
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

export function RecipeCard({ recipe, onToggleFavorite, onClick }: RecipeCardProps) {
  const isFavorite = recipe.isFavorite;

  return (
    <div 
      className={`bg-surface radius-card shadow-card flex p-3 gap-3 group ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''}`}
      onClick={() => onClick?.(recipe)}
    >
      <div className="w-[88px] h-[88px] shrink-0 relative radius-card overflow-hidden">
        <img 
          src={recipe.imageUrl} 
          alt={recipe.title} 
          className="w-full h-full object-cover"
        />
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleFavorite?.(recipe.id);
          }}
          className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-white shadow-sm text-ink-soft hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-90"
          aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          <Heart 
            size={14} 
            strokeWidth={2.5}
            className={`transition-colors ${isFavorite ? 'fill-primary text-primary' : 'text-[#D1D1D1]'}`} 
          />
        </button>
      </div>

      <div className="flex flex-col justify-center flex-1 min-w-0 py-0.5">
        <div className="flex flex-wrap gap-1.5 mb-1.5">
          {recipe.tags?.map((tag, idx) => (
            <span 
              key={idx} 
              className={`text-caption font-semibold px-2 py-0.5 rounded-md ${tagColorMap[tag.color] || tagColorMap.violet}`}
            >
              {tag.label}
            </span>
          ))}
        </div>
        
        <h3 className="font-display font-semibold text-ink text-body mb-1 truncate leading-tight">
          {recipe.title}
        </h3>
        
        <div className="flex items-center text-ink-soft text-small font-medium gap-1.5">
          <Clock size={14} strokeWidth={2} />
          <span>{recipe.prepTime}</span>
        </div>
      </div>
    </div>
  );
}
