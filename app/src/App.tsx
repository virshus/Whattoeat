import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BookOpen, RefreshCw, Trash2 } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import type { Session } from '@supabase/supabase-js';
import { Header } from './components/Header';
import { Drawer } from './components/Drawer';
import { WeeklyHighlight } from './components/WeeklyHighlight';
import { ShoppingCard } from './components/ShoppingCard';
import { RecipeList } from './components/RecipeList';
import { WeeklyPlanView } from './components/WeeklyPlanView';
import { RecipeSelector } from './components/RecipeSelector';
import { BottomSheet } from './components/BottomSheet';
import { RecipeDetailView } from './components/RecipeDetailView';
import { emptyWeekPlan, buildSharedMenuName } from './data';
import { Recipe, WeekPlan, ShoppingItem, IngredientCategory, User, Household } from './types';
import { ShoppingListView } from './components/ShoppingListView';
import { RecipesView } from './components/RecipesView';
import { AddRecipeView } from './components/AddRecipeView';
import { ProfileView } from './components/ProfileView';
import { InviteHouseholdSheet } from './components/InviteHouseholdSheet';
import { AuthView } from './components/AuthView';
import { syncShoppingItems } from './utils/shoppingList';
import {
  hasRecipes,
  isShoppingAllDone,
  isShoppingFullyEmpty,
  getMealSlotSubtitle,
  getMealSlotPhrase,
} from './utils/selectors';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import { signOut } from './services/auth';
import {
  deleteRecipe,
  joinHouseholdByCode,
  loadUserBootstrap,
  maybeRefreshDefaultHouseholdName,
  newLocalId,
  removeHouseholdMember,
  replaceShoppingItems,
  saveWeekPlan,
  updateHouseholdName,
  updateProfileName,
  upsertRecipe,
} from './services/householdData';
import {
  clearAddRecipeDraft,
  clearAddRecipeFormDraft,
  readAddRecipeDraft,
  readAddRecipeOpen,
  writeAddRecipeOpen,
} from './utils/addRecipeDraft';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(false);
  const [bootError, setBootError] = useState<string | null>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'weekly' | 'recipes' | 'shopping' | 'profile'>('home');
  const [weekPlan, setWeekPlan] = useState<WeekPlan>(emptyWeekPlan);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [household, setHousehold] = useState<Household | null>(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const [isRecipeSelectorOpen, setIsRecipeSelectorOpen] = useState(false);
  const [selectingSlot, setSelectingSlot] = useState<{ dayIndex: number; slotIndex: number } | null>(null);
  const [actionSlot, setActionSlot] = useState<{ dayIndex: number; slotIndex: number } | null>(null);
  const [viewingRecipe, setViewingRecipe] = useState<Recipe | null>(null);
  const [isAddRecipeOpen, setIsAddRecipeOpen] = useState(() => readAddRecipeOpen());
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  const skipNextShoppingPersist = useRef(false);
  const weekSaveTimer = useRef<number | null>(null);
  const shoppingSaveTimer = useRef<number | null>(null);
  const householdIdRef = useRef<string | null>(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    householdIdRef.current = household?.id ?? null;
  }, [household?.id]);

  useEffect(() => {
    writeAddRecipeOpen(isAddRecipeOpen);
  }, [isAddRecipeOpen]);

  // Reattach editing recipe after bootstrap / reload when the add sheet was open.
  useEffect(() => {
    if (!isAddRecipeOpen) return;
    const editingId = readAddRecipeDraft()?.editingRecipeId;
    if (!editingId) return;
    if (editingRecipe?.id === editingId) return;
    const found = recipes.find((r) => r.id === editingId);
    if (found) setEditingRecipe(found);
  }, [isAddRecipeOpen, recipes, editingRecipe?.id]);

  const bootstrap = useCallback(async (userId: string) => {
    const soft = hasLoadedRef.current;
    if (!soft) setBootstrapping(true);
    setBootError(null);
    try {
      const data = await loadUserBootstrap(userId);
      skipNextShoppingPersist.current = true;
      setUser(data.user);
      setHousehold(data.household);
      setRecipes(data.recipes);
      setWeekPlan(data.weekPlan);
      setShoppingItems(data.shoppingItems);
      hasLoadedRef.current = true;
      // Don't yank navigation when refreshing an already-loaded session (e.g. token refresh).
      if (!soft) setCurrentView('home');
    } catch (err) {
      setBootError(err instanceof Error ? err.message : 'No se pudo cargar tu menú.');
      setUser(null);
      setHousehold(null);
      hasLoadedRef.current = false;
    } finally {
      if (!soft) setBootstrapping(false);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setAuthReady(true);
      return;
    }

    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setAuthReady(true);
      if (data.session?.user) {
        void bootstrap(data.session.user.id);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);

      if (event === 'SIGNED_OUT' || !nextSession?.user) {
        hasLoadedRef.current = false;
        clearAddRecipeDraft();
        setIsAddRecipeOpen(false);
        setEditingRecipe(null);
        setUser(null);
        setHousehold(null);
        setRecipes([]);
        setWeekPlan(emptyWeekPlan);
        setShoppingItems([]);
        return;
      }

      // getSession already bootstraps the first load; ignore token refresh so the UI
      // (e.g. add-recipe draft) is not unmounted when switching apps/tabs.
      if (event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        return;
      }

      if (event === 'SIGNED_IN') {
        void bootstrap(nextSession.user.id);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [bootstrap]);

  useEffect(() => {
    setShoppingItems((prev) => {
      const next = syncShoppingItems(weekPlan, recipes, prev);
      return next;
    });
  }, [weekPlan, recipes]);

  useEffect(() => {
    const hid = householdIdRef.current;
    if (!hid || !session) return;
    if (weekSaveTimer.current) window.clearTimeout(weekSaveTimer.current);
    weekSaveTimer.current = window.setTimeout(() => {
      void saveWeekPlan(hid, weekPlan).catch((err) => console.error('[week_plan]', err));
    }, 400);
    return () => {
      if (weekSaveTimer.current) window.clearTimeout(weekSaveTimer.current);
    };
  }, [weekPlan, session]);

  useEffect(() => {
    const hid = householdIdRef.current;
    if (!hid || !session) return;
    if (skipNextShoppingPersist.current) {
      skipNextShoppingPersist.current = false;
      return;
    }
    if (shoppingSaveTimer.current) window.clearTimeout(shoppingSaveTimer.current);
    shoppingSaveTimer.current = window.setTimeout(() => {
      void replaceShoppingItems(hid, shoppingItems).catch((err) => console.error('[shopping]', err));
    }, 500);
    return () => {
      if (shoppingSaveTimer.current) window.clearTimeout(shoppingSaveTimer.current);
    };
  }, [shoppingItems, session]);

  const recipesLoaded = hasRecipes(recipes);
  const pendingIngredientsCount = shoppingItems.filter((i) => !i.isChecked).length;
  const shoppingIsEmpty = isShoppingFullyEmpty(shoppingItems);
  const shoppingAllDone = isShoppingAllDone(shoppingItems);
  const householdMemberCount = household?.members.length ?? 0;
  const isSharedHousehold = householdMemberCount > 1;

  const handleToggleShoppingItem = (id: string) => {
    setShoppingItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isChecked: !item.isChecked } : item))
    );
  };

  const handleAddShoppingItem = (category: IngredientCategory, name: string) => {
    const newItem: ShoppingItem = {
      id: newLocalId(),
      name,
      quantity: '',
      category,
      isChecked: false,
      isCustom: true,
    };
    setShoppingItems((prev) => [...prev, newItem]);
  };

  const handleDeleteCustomItem = (id: string) => {
    setShoppingItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleNavigate = (view: string) => {
    setCurrentView(view as typeof currentView);
    setIsMenuOpen(false);
  };

  const handleOpenAddRecipe = () => {
    setEditingRecipe(null);
    setIsAddRecipeOpen(true);
  };

  const handleOpenAddRecipeFromSelector = () => {
    setIsRecipeSelectorOpen(false);
    setSelectingSlot(null);
    setEditingRecipe(null);
    setIsAddRecipeOpen(true);
  };

  const handleGoToWeekly = () => {
    setCurrentView('weekly');
  };

  const handleUpdateName = async (name: string) => {
    if (!user || !household) return;
    setUser((prev) => (prev ? { ...prev, name } : prev));
    const prevDefault = buildSharedMenuName(household.members.map((m) => m.name));
    const members = household.members.map((m) =>
      m.userId === user.id ? { ...m, name } : m
    );
    const nextDefault = buildSharedMenuName(members.map((m) => m.name));
    const nextName = household.name === prevDefault ? nextDefault : household.name;
    setHousehold({ ...household, members, name: nextName });
    try {
      await updateProfileName(user.id, name);
      if (nextName !== household.name) {
        await updateHouseholdName(household.id, nextName);
      }
    } catch (err) {
      console.error('[profile]', err);
    }
  };

  const handleUpdateShareName = async (name: string) => {
    if (!household) return;
    setHousehold((prev) => (prev ? { ...prev, name } : prev));
    try {
      await updateHouseholdName(household.id, name);
    } catch (err) {
      console.error('[household name]', err);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!household || !user || userId === user.id) return;
    const members = household.members.filter((m) => m.userId !== userId);
    try {
      await removeHouseholdMember(household.id, userId);
      const nextName = await maybeRefreshDefaultHouseholdName(household, members);
      setHousehold({ ...household, members, name: nextName });
    } catch (err) {
      console.error('[remove member]', err);
      window.alert(
        err instanceof Error
          ? err.message
          : 'No pudimos sacar a esa persona del menú. Probá de nuevo.'
      );
    }
  };

  const handleJoinByCode = async (code: string) => {
    if (!session?.user) return;
    await joinHouseholdByCode(code);
    await bootstrap(session.user.id);
    setIsInviteOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('[logout]', err);
    }
  };

  const handleToggleFavorite = async (id: string) => {
    const recipe = recipes.find((r) => r.id === id);
    if (!recipe || !household) return;
    const updated = { ...recipe, isFavorite: !recipe.isFavorite };
    setRecipes((prev) => prev.map((r) => (r.id === id ? updated : r)));
    if (viewingRecipe?.id === id) {
      setViewingRecipe(updated);
    }
    try {
      await upsertRecipe(household.id, updated);
    } catch (err) {
      console.error('[favorite]', err);
    }
  };

  const handlePlanMeal = (dayIndex: number, slotIndex: number) => {
    if (!recipesLoaded) {
      handleOpenAddRecipe();
      return;
    }
    setSelectingSlot({ dayIndex, slotIndex });
    setIsRecipeSelectorOpen(true);
  };

  const updateWeekPlan = (updater: (prev: WeekPlan) => WeekPlan) => {
    setWeekPlan((prev) => {
      const newPlan = updater(prev);
      const totalCompleted = newPlan.days.reduce(
        (acc, day) => acc + day.slots.filter((s) => s.imageUrl).length,
        0
      );
      return {
        ...newPlan,
        completedMeals: totalCompleted,
        progressPercentage: Math.round((totalCompleted / newPlan.totalMeals) * 100),
      };
    });
  };

  const handleSelectRecipe = (recipe: Recipe) => {
    if (selectingSlot) {
      updateWeekPlan((prev) => {
        const newDays = [...prev.days];
        const newSlots = [...newDays[selectingSlot.dayIndex].slots];
        newSlots[selectingSlot.slotIndex] = {
          ...newSlots[selectingSlot.slotIndex],
          recipeTitle: recipe.title,
          imageUrl: recipe.imageUrl,
          prepTime: recipe.prepTime,
        };
        newDays[selectingSlot.dayIndex] = { ...newDays[selectingSlot.dayIndex], slots: newSlots };
        return { ...prev, days: newDays };
      });
    }
    setIsRecipeSelectorOpen(false);
    setSelectingSlot(null);
  };

  const handleClearWeek = () => {
    updateWeekPlan((prev) => ({
      ...prev,
      days: prev.days.map((day) => ({
        ...day,
        slots: day.slots.map((slot) => ({
          ...slot,
          recipeTitle: undefined,
          imageUrl: undefined,
          prepTime: undefined,
        })),
      })),
    }));
    setActionSlot(null);
  };

  const handleSaveRecipe = async (newRecipe: Recipe) => {
    if (!household) return;
    const withId = {
      ...newRecipe,
      id: editingRecipe?.id ?? newLocalId(),
    };
    try {
      const saved = await upsertRecipe(household.id, withId);
      if (editingRecipe) {
        setRecipes((prev) => prev.map((r) => (r.id === editingRecipe.id ? saved : r)));
        setViewingRecipe(saved);
      } else {
        setRecipes((prev) => [saved, ...prev]);
      }
    } catch (err) {
      console.error('[save recipe]', err);
      if (editingRecipe) {
        setRecipes((prev) => prev.map((r) => (r.id === editingRecipe.id ? withId : r)));
      } else {
        setRecipes((prev) => [withId, ...prev]);
      }
    }
    setIsAddRecipeOpen(false);
    setEditingRecipe(null);
  };

  const handleDeleteRecipe = async (id: string) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id));
    setViewingRecipe(null);
    try {
      await deleteRecipe(id);
    } catch (err) {
      console.error('[delete recipe]', err);
    }
  };

  const handleBack = () => {
    setCurrentView('home');
  };

  const getBottomSheetSubtitle = () => {
    if (!selectingSlot) return '';
    const day = weekPlan.days[selectingSlot.dayIndex];
    const slot = day.slots[selectingSlot.slotIndex];
    return getMealSlotSubtitle(slot.type, day.dayName);
  };

  if (!authReady) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center text-ink-soft text-small">
        Cargando…
      </div>
    );
  }

  if (!session) {
    return <AuthView onAuthenticated={() => {}} />;
  }

  if (bootstrapping || !user || !household) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center page-x gap-3">
        <p className="text-ink-soft text-small">{bootError ? bootError : 'Cargando tu menú…'}</p>
        {bootError && (
          <button
            type="button"
            onClick={() => session.user && void bootstrap(session.user.id)}
            className="text-primary font-semibold text-small"
          >
            Reintentar
          </button>
        )}
        {bootError && (
          <button type="button" onClick={() => void handleLogout()} className="text-ink-soft text-small">
            Cerrar sesión
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-safe">
      <Header
        user={user}
        onOpenMenu={() => setIsMenuOpen(true)}
        currentView={currentView}
        onBack={handleBack}
        householdMemberCount={householdMemberCount}
        shareName={household.name}
      />
      <Drawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        currentView={currentView}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      <main className="max-w-2xl mx-auto pb-6 pt-1 h-full flex flex-col">
        {currentView === 'home' ? (
          <>
            <WeeklyHighlight
              plan={weekPlan}
              hasRecipes={recipesLoaded}
              isSharedHousehold={isSharedHousehold}
              onCompleteNow={handleGoToWeekly}
              onAddRecipe={handleOpenAddRecipe}
            />
            <ShoppingCard
              ingredientsCount={pendingIngredientsCount}
              isEmpty={shoppingIsEmpty}
              isAllDone={shoppingAllDone}
              isSharedHousehold={isSharedHousehold}
              onClick={() => setCurrentView('shopping')}
            />
            <RecipeList
              recipes={recipes}
              onToggleFavorite={handleToggleFavorite}
              onRecipeClick={setViewingRecipe}
              onViewAll={() => setCurrentView('recipes')}
              onAddRecipe={handleOpenAddRecipe}
            />
          </>
        ) : currentView === 'weekly' ? (
          <>
            <WeeklyPlanView
              plan={weekPlan}
              hasRecipes={recipesLoaded}
              onPlanMeal={handlePlanMeal}
              onPlannedMealClick={(dayIndex, slotIndex) => setActionSlot({ dayIndex, slotIndex })}
              onAddRecipe={handleOpenAddRecipe}
              onClearWeek={handleClearWeek}
            />
            <ShoppingCard
              ingredientsCount={pendingIngredientsCount}
              isEmpty={shoppingIsEmpty}
              isAllDone={shoppingAllDone}
              isSharedHousehold={isSharedHousehold}
              onClick={() => setCurrentView('shopping')}
            />
          </>
        ) : currentView === 'shopping' ? (
          <ShoppingListView
            items={shoppingItems}
            onToggleItem={handleToggleShoppingItem}
            onAddItem={handleAddShoppingItem}
            onDeleteCustomItem={handleDeleteCustomItem}
            onGoToWeekly={handleGoToWeekly}
          />
        ) : currentView === 'recipes' ? (
          <RecipesView
            recipes={recipes}
            onSelect={setViewingRecipe}
            onToggleFavorite={handleToggleFavorite}
            onAddRecipe={handleOpenAddRecipe}
          />
        ) : currentView === 'profile' ? (
          <ProfileView
            user={user}
            household={household}
            onUpdateName={handleUpdateName}
            onUpdateShareName={handleUpdateShareName}
            onCreateHousehold={() => setIsInviteOpen(true)}
            onOpenInvite={() => setIsInviteOpen(true)}
            onRemoveMember={handleRemoveMember}
            onLogout={handleLogout}
          />
        ) : (
          <div className="page-x py-8 text-center text-ink-soft">
            <p className="section-title">Próximamente</p>
            <p className="text-small mt-1">Esta sección aún no está disponible.</p>
          </div>
        )}
      </main>

      <BottomSheet
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title="Invitar a compartir"
        subtitle="Mismo menú, mismas recetas, misma lista"
      >
        <InviteHouseholdSheet household={household} onJoinByCode={handleJoinByCode} />
      </BottomSheet>

      <BottomSheet
        isOpen={isRecipeSelectorOpen}
        onClose={() => {
          setIsRecipeSelectorOpen(false);
          setSelectingSlot(null);
        }}
        title="Seleccionar receta"
        subtitle={getBottomSheetSubtitle()}
      >
        <RecipeSelector
          recipes={recipes}
          onSelect={handleSelectRecipe}
          onToggleFavorite={handleToggleFavorite}
          onAddRecipe={handleOpenAddRecipeFromSelector}
        />
      </BottomSheet>

      <BottomSheet
        isOpen={!!actionSlot}
        onClose={() => setActionSlot(null)}
        title={
          actionSlot
            ? weekPlan.days[actionSlot.dayIndex].slots[actionSlot.slotIndex].recipeTitle || 'Opciones'
            : ''
        }
        subtitle={
          actionSlot
            ? `${getMealSlotPhrase(weekPlan.days[actionSlot.dayIndex].slots[actionSlot.slotIndex].type)} del ${weekPlan.days[actionSlot.dayIndex].dayName.toLowerCase()}`
            : ''
        }
      >
        <div className="flex flex-col gap-1 p-3 md:px-6 pb-6">
          <button
            className="flex items-center gap-3 p-3 radius-card hover:bg-surface active:scale-[0.98] transition-all text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onClick={() => {
              if (actionSlot) {
                const recipeTitle =
                  weekPlan.days[actionSlot.dayIndex].slots[actionSlot.slotIndex].recipeTitle;
                const recipe = recipes.find((r) => r.title === recipeTitle);
                if (recipe) setViewingRecipe(recipe);
              }
              setActionSlot(null);
            }}
          >
            <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-primary shrink-0">
              <BookOpen size={20} />
            </div>
            <span className="font-semibold text-body">Mostrar receta</span>
          </button>

          <button
            className="flex items-center gap-3 p-3 radius-card hover:bg-surface active:scale-[0.98] transition-all text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onClick={() => {
              const currentSlot = actionSlot;
              setActionSlot(null);
              if (currentSlot) handlePlanMeal(currentSlot.dayIndex, currentSlot.slotIndex);
            }}
          >
            <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-primary shrink-0">
              <RefreshCw size={20} />
            </div>
            <span className="font-semibold text-body">Modificar receta</span>
          </button>

          <button
            className="flex items-center gap-3 p-3 radius-card hover:bg-red-50 active:scale-[0.98] transition-all text-danger focus:outline-none focus-visible:ring-2 focus-visible:ring-danger"
            onClick={() => {
              if (actionSlot) {
                updateWeekPlan((prev) => {
                  const newDays = [...prev.days];
                  const newSlots = [...newDays[actionSlot.dayIndex].slots];
                  newSlots[actionSlot.slotIndex] = {
                    ...newSlots[actionSlot.slotIndex],
                    recipeTitle: undefined,
                    imageUrl: undefined,
                    prepTime: undefined,
                  };
                  newDays[actionSlot.dayIndex] = { ...newDays[actionSlot.dayIndex], slots: newSlots };
                  return { ...prev, days: newDays };
                });
              }
              setActionSlot(null);
            }}
          >
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-danger shrink-0">
              <Trash2 size={20} />
            </div>
            <span className="font-semibold text-body">Eliminar del menú</span>
          </button>
        </div>
      </BottomSheet>

      <AnimatePresence>
        {viewingRecipe && (
          <RecipeDetailView
            recipe={viewingRecipe}
            onBack={() => setViewingRecipe(null)}
            onToggleFavorite={handleToggleFavorite}
            onDelete={handleDeleteRecipe}
            onEdit={() => {
              // Start edit on the form immediately; drop any leftover "create" draft.
              const draft = readAddRecipeDraft();
              if (!draft || draft.editingRecipeId !== viewingRecipe.id) {
                clearAddRecipeFormDraft();
              }
              setEditingRecipe(viewingRecipe);
              setIsAddRecipeOpen(true);
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isAddRecipeOpen && (
          <AddRecipeView
            isOpen={isAddRecipeOpen}
            onClose={() => {
              setIsAddRecipeOpen(false);
              setEditingRecipe(null);
            }}
            initialData={editingRecipe || undefined}
            onSave={handleSaveRecipe}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
