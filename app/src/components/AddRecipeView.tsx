import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Camera, Clock, Users, Plus, GripVertical, Instagram, Globe, PenLine, Link as LinkIcon, ChevronRight, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Recipe, Tag } from '../types';
import { importRecipeFromUrl, ImportRecipeError } from '../services/importRecipe';
import { emptyFormState, mapDraftToForm, ALLOWED_IMPORT_TAGS } from '../types/importRecipe';
import { fileToPersistedImageUrl } from '../utils/imageDataUrl';
import { classifyIngredient } from '../utils/ingredientCategories';
import { isBuiltinRecipeTag } from '../utils/recipeTags';
import {
  clearAddRecipeDraft,
  draftFromRecipe,
  readAddRecipeDraft,
  writeAddRecipeDraft,
  type AddRecipeMethod,
} from '../utils/addRecipeDraft';

interface AddRecipeViewProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipe: Recipe) => void;
  initialData?: Recipe;
  /** Built-in + persisted custom tags available to toggle. */
  knownTags?: string[];
  /** Persist a newly created custom tag for future recipes/filters. */
  onCustomTagAdded?: (label: string) => void;
  /** Remove a custom tag from catalog, filters, and all recipes. */
  onCustomTagDeleted?: (label: string) => void;
}

const TAG_COLORS: Tag['color'][] = ['mint', 'violet', 'orange', 'lilac'];

function tagColorFor(label: string, index: number): Tag['color'] {
  if (label === 'Vegetariano' || label === 'Saludable') return 'mint';
  if (label === 'Rápido') return 'violet';
  if (label === 'Proteína') return 'orange';
  return TAG_COLORS[index % TAG_COLORS.length];
}

export function AddRecipeView({
  isOpen,
  onClose,
  onSave,
  initialData,
  knownTags,
  onCustomTagAdded,
  onCustomTagDeleted,
}: AddRecipeViewProps) {
  const [method, setMethod] = useState<AddRecipeMethod>(() => (initialData ? 'manual' : 'options'));
  const [url, setUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [isImageProcessing, setIsImageProcessing] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importWarning, setImportWarning] = useState<string | null>(null);
  const [sourceUrl, setSourceUrl] = useState(() => initialData?.source?.url || '');
  const [sourceName, setSourceName] = useState(() => initialData?.source?.name || '');
  
  // Recipe form state
  const [title, setTitle] = useState(() => initialData?.title ?? '');
  const [imageUrl, setImageUrl] = useState(() => initialData?.imageUrl ?? '');
  const [servings, setServings] = useState<number | null>(() => initialData?.servings ?? null);
  const [time, setTime] = useState(() => initialData?.prepTime?.replace(/\D/g, '') || '');
  const [tags, setTags] = useState<string[]>(() =>
    initialData?.tags
      ? initialData.tags.map((t) => t.label).filter((t) => t.toLowerCase() !== 'keto')
      : []
  );
  const [ingredients, setIngredients] = useState<{id: string, name: string, quantity: string}[]>(() =>
    initialData?.ingredients && initialData.ingredients.length > 0
      ? initialData.ingredients.map((i) => ({
          id: Math.random().toString(36).slice(2, 9),
          name: i.name,
          quantity: i.quantity,
        }))
      : [{ id: '1', name: '', quantity: '' }]
  );
  const [instructions, setInstructions] = useState<{id: string, text: string}[]>(() =>
    initialData?.instructions && initialData.instructions.length > 0
      ? initialData.instructions.map((i) => ({
          id: Math.random().toString(36).slice(2, 9),
          text: i.text,
        }))
      : [{ id: '1', text: '' }]
  );
  const [isAddTagOpen, setIsAddTagOpen] = useState(false);
  const [newTagDraft, setNewTagDraft] = useState('');
  const [tagError, setTagError] = useState<string | null>(null);
  const [tagPendingDelete, setTagPendingDelete] = useState<string | null>(null);

  /** Skip wiping form when remounting with same open session (tab/app switch). */
  const hydratedKeyRef = useRef<string | null>(null);
  const skipNextPersistRef = useRef(false);

  const resetEmptyForm = () => {
    const empty = emptyFormState();
    setTitle(empty.title);
    setImageUrl(empty.imageUrl);
    setServings(empty.servings);
    setTime(empty.time);
    setTags(empty.tags);
    setIngredients(empty.ingredients);
    setInstructions(empty.instructions);
    setSourceUrl('');
    setSourceName('');
    setImportWarning(null);
    setImportError(null);
  };

  const applyDraft = (draft: NonNullable<ReturnType<typeof readAddRecipeDraft>>, forceManual: boolean) => {
    setMethod(forceManual ? 'manual' : draft.method);
    setUrl(draft.url);
    setTitle(draft.title);
    setImageUrl(draft.imageUrl);
    setServings(draft.servings);
    setTime(draft.time);
    setTags(draft.tags.filter((t) => t.toLowerCase() !== 'keto'));
    setIngredients(draft.ingredients.length ? draft.ingredients : [{ id: '1', name: '', quantity: '' }]);
    setInstructions(draft.instructions.length ? draft.instructions : [{ id: '1', text: '' }]);
    setSourceUrl(draft.sourceUrl);
    setSourceName(draft.sourceName);
    setImportWarning(draft.importWarning);
    setImportError(draft.importError);
  };

  const applyRecipe = (recipe: Recipe) => {
    const fromRecipe = draftFromRecipe(recipe);
    setMethod('manual');
    setUrl('');
    setTitle(fromRecipe.title);
    setImageUrl(fromRecipe.imageUrl);
    setServings(fromRecipe.servings);
    setTime(fromRecipe.time);
    setTags(fromRecipe.tags.filter((t) => t.toLowerCase() !== 'keto'));
    setIngredients(fromRecipe.ingredients);
    setInstructions(fromRecipe.instructions);
    setSourceUrl(fromRecipe.sourceUrl);
    setSourceName(fromRecipe.sourceName);
    setImportWarning(null);
    setImportError(null);
  };

  useEffect(() => {
    if (!isOpen) {
      hydratedKeyRef.current = null;
      return;
    }

    const sessionKey = initialData?.id ?? 'create';
    if (hydratedKeyRef.current === sessionKey) return;
    hydratedKeyRef.current = sessionKey;
    skipNextPersistRef.current = true;

    const saved = readAddRecipeDraft();

    if (initialData) {
      // Edit mode: always the form. Restore draft only if it belongs to this recipe
      // and was already on the form (never re-open the "tipo de carga" picker).
      const editDraft =
        saved &&
        saved.editingRecipeId === initialData.id &&
        saved.method === 'manual'
          ? saved
          : null;
      if (editDraft) applyDraft(editDraft, true);
      else applyRecipe(initialData);
      return;
    }

    const createDraft = saved && !saved.editingRecipeId ? saved : null;
    if (createDraft) {
      applyDraft(createDraft, false);
      return;
    }

    setMethod('options');
    setUrl('');
    resetEmptyForm();
  }, [isOpen, initialData]);

  // Persist draft while the sheet is open (survives tab/app switch + remount).
  useEffect(() => {
    if (!isOpen) return;
    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false;
      return;
    }
    // Never persist the options picker as an "edit" draft — it breaks reopen.
    if (initialData && method !== 'manual') return;

    writeAddRecipeDraft({
      editingRecipeId: initialData?.id ?? null,
      method,
      url,
      title,
      imageUrl,
      servings,
      time,
      tags,
      ingredients,
      instructions,
      sourceUrl,
      sourceName,
      importWarning,
      importError,
    });
  }, [
    isOpen,
    initialData?.id,
    method,
    url,
    title,
    imageUrl,
    servings,
    time,
    tags,
    ingredients,
    instructions,
    sourceUrl,
    sourceName,
    importWarning,
    importError,
  ]);

  const handleClose = () => {
    clearAddRecipeDraft();
    hydratedKeyRef.current = null;
    setMethod('options');
    setUrl('');
    setIsImporting(false);
    setIsAddTagOpen(false);
    setNewTagDraft('');
    setTagError(null);
    setTagPendingDelete(null);
    resetEmptyForm();
    onClose();
  };

  const selectableTags = (() => {
    const base = knownTags?.length ? knownTags : [...ALLOWED_IMPORT_TAGS];
    const seen = new Set(base.map((t) => t.toLowerCase()));
    const extras = tags.filter((t) => !seen.has(t.toLowerCase()) && t.toLowerCase() !== 'keto');
    return [...base, ...extras];
  })();

  const handleConfirmAddTag = () => {
    const trimmed = newTagDraft.trim();
    if (!trimmed) {
      setTagError('Escribí un nombre para la etiqueta.');
      return;
    }
    if (trimmed.toLowerCase() === 'keto') {
      setTagError('Esa etiqueta ya no está disponible.');
      return;
    }
    const exists = tags.some((t) => t.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      setTagError('Esa etiqueta ya está agregada.');
      return;
    }
    setTags([...tags, trimmed]);
    onCustomTagAdded?.(trimmed);
    setIsAddTagOpen(false);
    setNewTagDraft('');
    setTagError(null);
  };

  const handleConfirmDeleteTag = () => {
    if (!tagPendingDelete) return;
    const label = tagPendingDelete;
    setTags((prev) => prev.filter((t) => t.toLowerCase() !== label.toLowerCase()));
    setTagPendingDelete(null);
    onCustomTagDeleted?.(label);
  };

  const handleSave = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setImportError('Agregá un nombre a la receta para guardar.');
      return;
    }

    const cleanedIngredients = ingredients
      .filter((ing) => ing.name.trim())
      .map((ing) => ({
        name: ing.name.trim(),
        quantity: ing.quantity.trim(),
        category: classifyIngredient(ing.name.trim()),
      }));

    const cleanedInstructions = instructions
      .filter((inst) => inst.text.trim())
      .map((inst, index) => ({
        step: index + 1,
        text: inst.text.trim(),
      }));

    const newRecipe: Recipe = {
      id: initialData?.id || Math.random().toString(36).substring(7),
      title: trimmedTitle,
      imageUrl: imageUrl.trim(),
      prepTime: time.trim() ? `${time.trim()} min` : '',
      servings: servings ?? undefined,
      isFavorite: initialData?.isFavorite ?? false,
      tags: tags.map((t, i) => ({ label: t, color: tagColorFor(t, i) })),
      ingredients: cleanedIngredients,
      instructions: cleanedInstructions,
      ...(sourceUrl || sourceName
        ? {
            source: {
              name: sourceName || (sourceUrl.includes('instagram') ? 'Agregada desde Instagram' : 'Agregada desde la web'),
              url: sourceUrl || undefined,
            },
          }
        : {}),
    };
    onSave(newRecipe);
    handleClose();
  };

  const handleImport = async () => {
    if (!url.trim() || (method !== 'instagram' && method !== 'web')) return;
    setIsImporting(true);
    setImportError(null);
    setImportWarning(null);
    try {
      const draft = await importRecipeFromUrl(url.trim(), method);
      const form = mapDraftToForm(draft, method, url.trim());
      setTitle(form.title);
      setImageUrl(form.imageUrl);
      setTime(form.time);
      setServings(form.servings);
      setTags(form.tags.filter((t) => t.toLowerCase() !== 'keto'));
      setIngredients(form.ingredients);
      setInstructions(form.instructions);
      setSourceUrl(form.sourceUrl);
      setSourceName(form.sourceName);
      setImportWarning(form.importWarning);
      setMethod('manual');
    } catch (err) {
      const message =
        err instanceof ImportRecipeError
          ? err.message
          : 'No pudimos leer ese link. Probá otro o cargala manualmente.';
      setImportError(message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setIsImageProcessing(true);
    setImportError(null);
    try {
      const dataUrl = await fileToPersistedImageUrl(file);
      setImageUrl(dataUrl);
    } catch {
      setImportError('No pudimos procesar esa imagen. Probá con otra foto.');
    } finally {
      setIsImageProcessing(false);
    }
  };

  const renderContent = () => {
    // Edit never uses the upload-type picker.
    if (method === 'options' && !initialData) {
      return (
        <div className="flex-1 overflow-y-auto page-x py-4">
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => setMethod('manual')}
              className="w-full flex items-center justify-between radius-card p-4 bg-white shadow-sm border border-surface hover:shadow-md transition-shadow text-left group focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <PenLine size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-semibold text-body text-ink">Manualmente</h3>
                  <p className="text-small text-ink-soft">Ingresa los datos paso a paso</p>
                </div>
              </div>
              <ChevronRight size={24} className="text-ink-soft group-hover:text-primary transition-colors" />
            </button>

            <button 
              onClick={() => setMethod('instagram')}
              className="w-full flex items-center justify-between radius-card p-4 bg-white shadow-sm border border-surface hover:shadow-md transition-shadow text-left group focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#E1306C]/10 flex items-center justify-center text-[#E1306C]">
                  <Instagram size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-semibold text-body text-ink">Desde instagram</h3>
                  <p className="text-small text-ink-soft">Pega el link de un reel o post</p>
                </div>
              </div>
              <ChevronRight size={24} className="text-ink-soft group-hover:text-primary transition-colors" />
            </button>

            <button 
              onClick={() => setMethod('web')}
              className="w-full flex items-center justify-between radius-card p-4 bg-white shadow-sm border border-surface hover:shadow-md transition-shadow text-left group focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#4285F4]/10 flex items-center justify-center text-[#4285F4]">
                  <Globe size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-semibold text-body text-ink">Desde un sitio web</h3>
                  <p className="text-small text-ink-soft">Pega el link de una receta</p>
                </div>
              </div>
              <ChevronRight size={24} className="text-ink-soft group-hover:text-primary transition-colors" />
            </button>
          </div>
        </div>
      );
    }

    if (method === 'instagram' || method === 'web') {
      const isInstagram = method === 'instagram';
      return (
        <div className="flex-1 overflow-y-auto page-x py-4 flex flex-col gap-4">
          <div className="text-center mb-4">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${isInstagram ? 'bg-[#E1306C]/10 text-[#E1306C]' : 'bg-[#4285F4]/10 text-[#4285F4]'}`}>
              {isInstagram ? <Instagram size={32} strokeWidth={2} /> : <Globe size={32} strokeWidth={2} />}
            </div>
            <h3 className="section-title text-ink mb-2">
              {isInstagram ? 'Pega el link de instagram' : 'Pega el link del sitio web'}
            </h3>
            <p className="text-ink-soft text-small">
              Analizamos el link y completamos solo lo que encontremos. Lo demás lo dejamos en blanco.
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-ink-soft">
              <LinkIcon size={20} strokeWidth={2.5} />
            </div>
            <input 
              type="url" 
              placeholder="https://..." 
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setImportError(null);
              }}
              className="w-full bg-white border-none radius-card py-3 pl-12 pr-4 text-ink font-medium placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
              autoFocus
              disabled={isImporting}
            />
          </div>

          {isImporting && (
            <p className="text-small text-ink-soft text-center" role="status">
              Analizando el link…
            </p>
          )}
          {importError && (
            <p className="text-small text-danger text-center" role="alert">
              {importError}
            </p>
          )}
        </div>
      );
    }

    if (method === 'manual') {
      return (
        <div className="flex-1 overflow-y-auto page-x py-4 flex flex-col gap-4">
          {importWarning && (
            <div className="bg-warning/15 text-ink text-small radius-card px-4 py-3" role="status">
              {importWarning}
            </div>
          )}
          {importError && (
            <div className="bg-danger/10 text-danger text-small radius-card px-4 py-3" role="alert">
              {importError}
            </div>
          )}
          {/* Photo Uploader */}
          <div className="relative w-full h-56 md:h-64 radius-card overflow-hidden bg-white border-2 border-dashed border-border shadow-sm group shrink-0">
            <input 
              type="file" 
              accept="image/*" 
              disabled={isImageProcessing}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-wait" 
              onChange={handleImageChange} 
            />
            {isImageProcessing ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-ink-soft bg-white/80 pointer-events-none">
                <span className="font-medium text-sm">Procesando foto…</span>
              </div>
            ) : imageUrl ? (
              <>
                <img src={imageUrl} alt="Receta" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <span className="bg-white px-4 py-2 rounded-full font-semibold text-sm text-ink shadow-sm flex items-center gap-2">
                    <Camera size={16} />
                    Cambiar foto
                  </span>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-ink-soft group-hover:bg-surface transition-colors pointer-events-none">
                <div className="w-12 h-12 rounded-full bg-surface-dark/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Camera size={24} strokeWidth={2} className="text-ink" />
                </div>
                <span className="font-medium text-sm">Toca para agregar foto</span>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <input 
              type="text" 
              placeholder="Nombre de la receta" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border-none radius-card py-3 px-4 text-ink font-medium placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-primary shadow-sm" 
            />
          </div>

          {/* Time & Servings Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border-none radius-card p-3 shadow-sm flex flex-col items-center justify-center gap-1">
              <div className="flex items-center gap-2 text-ink-soft mb-1">
                <Clock size={14} strokeWidth={2.5} />
                <span className="text-caption font-semibold text-ink-soft uppercase tracking-wider">Tiempo (min)</span>
              </div>
              <input 
                type="text"
                inputMode="numeric"
                placeholder="—"
                value={time}
                onChange={(e) => setTime(e.target.value.replace(/[^\d]/g, ''))}
                className="w-full text-center text-h2 font-semibold text-ink focus:outline-none placeholder:text-ink-soft"
              />
            </div>
            
            <div className="bg-white border-none radius-card p-3 shadow-sm flex flex-col items-center justify-center gap-1">
              <div className="flex items-center gap-2 text-ink-soft mb-1">
                <Users size={14} strokeWidth={2.5} />
                <span className="text-caption font-semibold text-ink-soft uppercase tracking-wider">Porciones</span>
              </div>
              <div className="flex items-center justify-between w-full max-w-[90px] mx-auto">
                <button 
                  type="button"
                  onClick={() => setServings((prev) => Math.max(1, (prev ?? 1) - 1))}
                  className="w-7 h-7 rounded-full border-none flex items-center justify-center text-ink hover:bg-surface focus:outline-none active:scale-95"
                >
                  -
                </button>
                <span className="text-h2 font-semibold text-ink">{servings ?? '—'}</span>
                <button 
                  type="button"
                  onClick={() => setServings((prev) => (prev ?? 0) + 1)}
                  className="w-7 h-7 rounded-full border-none flex items-center justify-center text-ink hover:bg-surface focus:outline-none active:scale-95"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <h3 className="font-semibold text-body text-ink mb-3">Etiquetas</h3>
            <div className="flex flex-wrap gap-2">
              {selectableTags.map((presetTag) => {
                const isSelected = tags.some((t) => t.toLowerCase() === presetTag.toLowerCase());
                const isCustom = !isBuiltinRecipeTag(presetTag);
                return (
                  <div
                    key={presetTag}
                    className={`inline-flex items-center rounded-full text-sm font-semibold transition-colors ${
                      isSelected
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-white text-ink-soft border border-border'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setTags(tags.filter((t) => t.toLowerCase() !== presetTag.toLowerCase()));
                        } else {
                          setTags([...tags, presetTag]);
                        }
                      }}
                      className={`px-3 py-1.5 focus:outline-none ${isCustom ? 'pr-1.5' : ''}`}
                    >
                      {presetTag}
                    </button>
                    {isCustom && (
                      <button
                        type="button"
                        onClick={() => setTagPendingDelete(presetTag)}
                        aria-label={`Eliminar etiqueta ${presetTag}`}
                        className={`pr-2.5 pl-0.5 py-1.5 focus:outline-none ${
                          isSelected ? 'text-white/90 hover:text-white' : 'text-ink-soft hover:text-red-500'
                        }`}
                      >
                        <X size={14} strokeWidth={2.5} />
                      </button>
                    )}
                  </div>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  setNewTagDraft('');
                  setTagError(null);
                  setIsAddTagOpen(true);
                }}
                className="h-[32px] px-3 rounded-full border-2 border-dashed border-border flex items-center justify-center text-ink-soft hover:border-primary hover:text-primary transition-colors focus:outline-none active:scale-95 gap-1"
              >
                <Plus size={14} strokeWidth={2.5} />
                <span className="text-sm font-semibold">Otra</span>
              </button>
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <h3 className="font-semibold text-body text-ink mb-3">Ingredientes</h3>
            <div className="flex flex-col gap-3">
              {ingredients.map((ing, idx) => (
                <div key={ing.id} className="flex items-center gap-3 bg-white border-none radius-card p-2 shadow-sm">
                  <button className="text-ink-soft/40 cursor-grab active:cursor-grabbing focus:outline-none px-1">
                    <GripVertical size={18} />
                  </button>
                  <input 
                    type="text" 
                    placeholder="Ingrediente" 
                    value={ing.name}
                    onChange={(e) => {
                      const newIngs = [...ingredients];
                      newIngs[idx].name = e.target.value;
                      setIngredients(newIngs);
                    }}
                    className="flex-1 bg-transparent border-none text-body text-ink font-medium placeholder:text-ink-soft focus:outline-none min-w-0"
                  />
                  <input 
                    type="text" 
                    placeholder="Cant." 
                    value={ing.quantity}
                    onChange={(e) => {
                      const newIngs = [...ingredients];
                      newIngs[idx].quantity = e.target.value;
                      setIngredients(newIngs);
                    }}
                    className="w-[72px] bg-surface radius-input py-1.5 px-2 text-small text-ink font-semibold focus:outline-none text-center"
                  />
                  <button 
                    onClick={() => setIngredients(ingredients.filter(i => i.id !== ing.id))}
                    className="p-2 text-ink-soft hover:text-red-500 focus:outline-none shrink-0"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              
              <button 
                onClick={() => setIngredients([...ingredients, { id: Math.random().toString(), name: '', quantity: '' }])}
                className="flex items-center gap-1.5 text-primary font-semibold text-small hover:opacity-80 focus:outline-none self-start mt-1 px-2"
              >
                <Plus size={16} strokeWidth={3} />
                Agregar ingrediente
              </button>
            </div>
          </div>

          {/* Preparation */}
          <div className="pb-8">
            <h3 className="font-semibold text-body text-ink mb-3">Preparación</h3>
            <div className="flex flex-col gap-4">
              {instructions.map((inst, idx) => (
                <div key={inst.id} className="flex items-start gap-3">
                  <div className="w-7 h-7 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-small mt-1">
                    {idx + 1}
                  </div>
                  <div className="flex-1 relative">
                    <textarea 
                      placeholder="Describe este paso..." 
                      value={inst.text}
                      onChange={(e) => {
                        const newInsts = [...instructions];
                        newInsts[idx].text = e.target.value;
                        setInstructions(newInsts);
                      }}
                      className="w-full bg-white border-none radius-card p-3.5 pr-10 text-body text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px] resize-none shadow-sm"
                    />
                    <button 
                      onClick={() => setInstructions(instructions.filter(i => i.id !== inst.id))}
                      className="absolute top-2 right-2 p-1.5 text-ink-soft hover:text-red-500 focus:outline-none"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}

              <button 
                onClick={() => setInstructions([...instructions, { id: Math.random().toString(), text: '' }])}
                className="flex items-center gap-1.5 text-primary font-semibold text-small hover:opacity-80 focus:outline-none self-start mt-1 px-2"
              >
                <Plus size={16} strokeWidth={3} />
                Agregar paso
              </button>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-canvas z-[100] flex flex-col h-full overflow-hidden"
    >
      <AnimatePresence>
        {isAddTagOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4"
            onClick={() => setIsAddTagOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white radius-card p-5 max-w-sm w-full shadow-xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="add-tag-title"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 id="add-tag-title" className="section-title mb-2">
                Nueva etiqueta
              </h3>
              <p className="text-ink-soft text-small mb-4">
                Escribí un nombre corto para organizar esta receta.
              </p>
              <input
                type="text"
                value={newTagDraft}
                onChange={(e) => {
                  setNewTagDraft(e.target.value);
                  setTagError(null);
                }}
                placeholder="Ej. Sin TACC"
                autoFocus
                maxLength={24}
                aria-label="Nombre de la etiqueta"
                className="w-full bg-canvas radius-input px-3 py-3 text-body font-medium text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-primary mb-2"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleConfirmAddTag();
                  }
                  if (e.key === 'Escape') setIsAddTagOpen(false);
                }}
              />
              {tagError && (
                <p className="text-small text-danger mb-3" role="alert">
                  {tagError}
                </p>
              )}
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsAddTagOpen(false)}
                  className="flex-1 py-3 px-4 radius-pill font-semibold text-ink bg-surface transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAddTag}
                  className="flex-1 py-3 px-4 radius-pill font-semibold text-white bg-primary hover:opacity-90 transition-opacity"
                >
                  Agregar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {tagPendingDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4"
            onClick={() => setTagPendingDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white radius-card p-5 max-w-sm w-full shadow-xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-tag-title"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-11 h-11 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-3">
                <AlertTriangle size={22} strokeWidth={2.5} />
              </div>
              <h3 id="delete-tag-title" className="section-title mb-2">
                Eliminar etiqueta
              </h3>
              <p className="text-ink-soft text-small mb-5">
                Se va a eliminar «{tagPendingDelete}» y el filtro correspondiente. Si estaba aplicada
                en otras recetas, también se va a borrar de ellas. Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setTagPendingDelete(null)}
                  className="flex-1 py-3 px-4 radius-pill font-semibold text-ink bg-surface transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteTag}
                  className="flex-1 py-3 px-4 radius-pill font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 md:px-8 mb-2 shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={
              initialData || method === 'options'
                ? handleClose
                : () => setMethod('options')
            }
            className="w-11 h-11 bg-white rounded-full flex items-center justify-center text-ink hover:text-primary transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-95 shrink-0"
          >
            <ChevronLeft size={24} strokeWidth={2.5} className="-ml-0.5" />
          </button>
          
          <h1 className="text-ink section-title">
            {initialData ? 'Editar receta' : method === 'options' ? 'Agregar receta' : 
             method === 'manual' ? 'Nueva receta' : 'Importar receta'}
          </h1>
        </div>
        
        {method === 'manual' ? (
          <button 
            className="text-primary font-semibold text-body hover:opacity-80 focus:outline-none active:scale-95 disabled:opacity-50 px-2"
            onClick={handleSave}
            disabled={!title.trim()}
          >
            Guardar
          </button>
        ) : method === 'instagram' || method === 'web' ? (
          <button 
            className="text-primary font-semibold text-body hover:opacity-80 focus:outline-none active:scale-95 disabled:opacity-50 px-2"
            disabled={!url.trim() || isImporting}
            onClick={handleImport}
          >
            {isImporting ? 'Analizando…' : 'Importar'}
          </button>
        ) : null}
      </header>

      {/* Content */}
      {renderContent()}
    </motion.div>
  );
}
