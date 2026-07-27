import React, { useState } from 'react';
import { ArrowLeft, Heart, Link as LinkIcon, PenSquare, Clock, Utensils, Trash2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Recipe, Tag } from '../types';

interface RecipeDetailViewProps {
  recipe: Recipe;
  onBack: () => void;
  onToggleFavorite?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: () => void;
}

const tagColorMap: Record<Tag['color'], string> = {
  mint: 'bg-[#E5F5F0] text-[#00875A]',
  violet: 'bg-[#F0E5FF] text-[#7A00C7]',
  orange: 'bg-[#FFF0E5] text-[#D96B00]',
  lilac: 'bg-[#F0E5FF] text-[#7A00C7]',
};

export function RecipeDetailView({ recipe, onBack, onToggleFavorite, onDelete, onEdit }: RecipeDetailViewProps) {
  const isFavorite = recipe.isFavorite;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-[#FAFAFA] z-[100] flex flex-col overflow-y-auto"
    >
      <AnimatePresence>
        {showDeleteConfirm && (
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
            >
              <div className="w-11 h-11 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-3">
                <AlertTriangle size={22} strokeWidth={2.5} />
              </div>
              <h3 className="section-title mb-2">Eliminar receta</h3>
              <p className="text-ink-soft text-small mb-5">
                ¿Estás seguro que quieres eliminar "{recipe.title}"? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 px-4 radius-pill font-semibold text-ink bg-surface transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => onDelete?.(recipe.id)}
                  className="flex-1 py-3 px-4 radius-pill font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative h-60 shrink-0">
        <img 
          src={recipe.imageUrl} 
          alt={recipe.title} 
          className="w-full h-full object-cover"
          style={{ borderRadius: '0 0 var(--radius-card) var(--radius-card)' }}
        />
        
        <div className="absolute top-0 left-0 right-0 p-4 pt-5 flex justify-between items-start">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center text-ink hover:scale-105 active:scale-95 transition-transform"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex gap-2">
            <button 
              onClick={() => onToggleFavorite?.(recipe.id)}
              className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
            >
              <Heart 
                size={18} 
                className={isFavorite ? 'fill-[#7A00C7] text-[#7A00C7]' : 'text-ink'} 
              />
            </button>
            <button 
              onClick={onEdit}
              className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center text-ink hover:scale-105 active:scale-95 transition-transform"
            >
              <PenSquare size={18} />
            </button>
            {onDelete && (
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center text-red-500 hover:scale-105 active:scale-95 transition-transform"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="page-x py-5 max-w-2xl mx-auto w-full">
        <h1 className="font-display font-semibold text-h1 text-ink leading-tight mb-2">
          {recipe.title}
        </h1>
        
        <div className="flex items-center gap-3 text-small text-ink-soft font-medium mb-3">
          <div className="flex items-center gap-1.5">
            <Clock size={14} />
            <span>{recipe.prepTime}</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-border"></span>
          <div className="flex items-center gap-1.5">
            <Utensils size={14} />
            <span>Rinde {recipe.servings || 1} porciones</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          {recipe.tags?.map((tag, idx) => (
            <span 
              key={idx} 
              className={`px-2.5 py-0.5 rounded-full text-caption font-semibold tracking-wide ${tagColorMap[tag.color] || 'bg-surface text-ink-soft'}`}
            >
              {tag.label}
            </span>
          ))}
        </div>

        {recipe.source && (
          <div className="bg-white radius-card p-3.5 shadow-card flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-full bg-surface flex items-center justify-center shrink-0">
              <LinkIcon size={16} className="text-ink-soft" />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-small text-ink-soft font-medium">
                {recipe.source.name}
              </span>
              {recipe.source.url && (
                <a 
                  href={recipe.source.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-small text-primary font-semibold hover:underline truncate"
                >
                  Ver publicación original
                </a>
              )}
            </div>
          </div>
        )}

        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <div className="mb-5">
            <h2 className="section-title mb-3">Ingredientes</h2>
            <div className="bg-white radius-card shadow-card overflow-hidden">
              {recipe.ingredients.map((ingredient, idx) => (
                <div 
                  key={idx}
                  className={`flex justify-between items-center px-4 py-2.5 ${
                    idx !== recipe.ingredients!.length - 1 ? 'border-b border-surface' : ''
                  }`}
                >
                  <span className="text-body font-medium text-ink">{ingredient.name}</span>
                  <span className="text-body font-medium text-ink-soft">{ingredient.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {recipe.instructions && recipe.instructions.length > 0 && (
          <div className="mb-5">
            <h2 className="section-title mb-4">Preparación</h2>
            <div className="flex flex-col gap-4">
              {recipe.instructions.map((instruction) => (
                <div key={instruction.step} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-small shrink-0 shadow-sm mt-0.5">
                    {instruction.step}
                  </div>
                  <p className="text-body leading-relaxed text-ink flex-1">
                    {instruction.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
