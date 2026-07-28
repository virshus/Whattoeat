import { emptyWeekPlan } from '../data';
import type {
  Household,
  HouseholdMember,
  Ingredient,
  IngredientCategory,
  Instruction,
  Recipe,
  ShoppingItem,
  Tag,
  User,
  WeekPlan,
} from '../types';
import { buildSharedMenuName } from '../data';
import { supabase } from '../lib/supabase';

type ProfileRow = { id: string; name: string; email: string | null };
type HouseholdRow = { id: string; name: string; invite_code: string };
type MemberRow = {
  household_id: string;
  user_id: string;
  role: 'owner' | 'member';
  joined_at: string;
  profiles: ProfileRow | ProfileRow[] | null;
};

function one<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

function mapRecipe(row: {
  id: string;
  title: string;
  image_url: string;
  prep_time: string;
  servings: number | null;
  tags: unknown;
  is_favorite: boolean;
  source: unknown;
  ingredients: unknown;
  instructions: unknown;
}): Recipe {
  return {
    id: row.id,
    title: row.title,
    imageUrl: row.image_url,
    prepTime: row.prep_time,
    servings: row.servings ?? undefined,
    tags: (row.tags as Tag[]) ?? [],
    isFavorite: row.is_favorite,
    source: (row.source as Recipe['source']) ?? undefined,
    ingredients: (row.ingredients as Ingredient[]) ?? [],
    instructions: (row.instructions as Instruction[]) ?? [],
  };
}

function withPlanStats(days: WeekPlan['days'], totalMeals = 10): WeekPlan {
  const completedMeals = days.reduce(
    (acc, day) => acc + day.slots.filter((s) => s.imageUrl).length,
    0
  );
  return {
    days,
    totalMeals,
    completedMeals,
    progressPercentage: Math.round((completedMeals / totalMeals) * 100),
  };
}

export async function loadUserBootstrap(userId: string): Promise<{
  user: User;
  household: Household;
  recipes: Recipe[];
  weekPlan: WeekPlan;
  shoppingItems: ShoppingItem[];
}> {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, name, email')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    throw new Error(profileError?.message || 'No encontramos tu perfil.');
  }

  const { data: membership, error: memberError } = await supabase
    .from('household_members')
    .select('household_id, role')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();

  if (memberError || !membership) {
    throw new Error(memberError?.message || 'No encontramos tu menú compartido.');
  }

  const householdId = membership.household_id as string;

  const [householdRes, membersRes, recipesRes, planRes, shoppingRes] = await Promise.all([
    supabase.from('households').select('id, name, invite_code').eq('id', householdId).single(),
    supabase
      .from('household_members')
      .select('household_id, user_id, role, joined_at, profiles(id, name, email)')
      .eq('household_id', householdId),
    supabase.from('recipes').select('*').eq('household_id', householdId).order('created_at'),
    supabase.from('week_plans').select('days, total_meals').eq('household_id', householdId).maybeSingle(),
    supabase.from('shopping_items').select('*').eq('household_id', householdId),
  ]);

  if (householdRes.error || !householdRes.data) {
    throw new Error(householdRes.error?.message || 'No se pudo cargar el hogar.');
  }

  const members: HouseholdMember[] = ((membersRes.data as MemberRow[] | null) ?? []).map((m) => {
    const p = one(m.profiles);
    return {
      userId: m.user_id,
      name: p?.name ?? 'Sin nombre',
      email: p?.email ?? undefined,
      role: m.role,
      joinedAt: m.joined_at,
    };
  });

  const household: Household = {
    id: householdRes.data.id,
    name: householdRes.data.name,
    inviteCode: householdRes.data.invite_code,
    members,
  };

  const recipes = (recipesRes.data ?? []).map(mapRecipe);
  const weekPlan = planRes.data?.days
    ? withPlanStats(planRes.data.days as WeekPlan['days'], planRes.data.total_meals ?? 10)
    : emptyWeekPlan;

  const shoppingItems: ShoppingItem[] = (shoppingRes.data ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    quantity: (row.quantity as string) ?? '',
    category: row.category as IngredientCategory,
    isChecked: Boolean(row.is_checked),
    isCustom: Boolean(row.is_custom),
  }));

  return {
    user: {
      id: profile.id,
      name: profile.name,
      email: profile.email ?? undefined,
    },
    household,
    recipes,
    weekPlan,
    shoppingItems,
  };
}

export async function updateProfileName(userId: string, name: string): Promise<void> {
  const { error } = await supabase.from('profiles').update({ name }).eq('id', userId);
  if (error) throw new Error(error.message);
}

export async function updateHouseholdName(householdId: string, name: string): Promise<void> {
  const { error } = await supabase.from('households').update({ name }).eq('id', householdId);
  if (error) throw new Error(error.message);
}

export async function maybeRefreshDefaultHouseholdName(
  household: Household,
  nextMembers: HouseholdMember[]
): Promise<string> {
  const prevDefault = buildSharedMenuName(household.members.map((m) => m.name));
  const nextDefault = buildSharedMenuName(nextMembers.map((m) => m.name));
  if (household.name === prevDefault && household.name !== nextDefault) {
    await updateHouseholdName(household.id, nextDefault);
    return nextDefault;
  }
  return household.name;
}

export async function removeHouseholdMember(
  _householdId: string,
  userId: string
): Promise<void> {
  // RPC (security definer): RLS table DELETE can report success with 0 rows.
  const { error } = await supabase.rpc('remove_household_member', {
    p_user_id: userId,
  });
  if (error) throw new Error(error.message);
}

export async function joinHouseholdByCode(code: string): Promise<string> {
  const { data, error } = await supabase.rpc('join_household_by_code', {
    p_code: code.trim(),
  });
  if (error) throw new Error(error.message);
  return data as string;
}

export async function upsertRecipe(householdId: string, recipe: Recipe): Promise<Recipe> {
  const payload = {
    id: recipe.id,
    household_id: householdId,
    title: recipe.title,
    image_url: recipe.imageUrl,
    prep_time: recipe.prepTime,
    servings: recipe.servings ?? null,
    tags: recipe.tags ?? [],
    is_favorite: recipe.isFavorite,
    source: recipe.source ?? null,
    ingredients: recipe.ingredients ?? [],
    instructions: recipe.instructions ?? [],
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from('recipes').upsert(payload).select('*').single();
  if (error) throw new Error(error.message);
  return mapRecipe(data);
}

export async function deleteRecipe(recipeId: string): Promise<void> {
  const { error } = await supabase.from('recipes').delete().eq('id', recipeId);
  if (error) throw new Error(error.message);
}

export async function saveWeekPlan(householdId: string, plan: WeekPlan): Promise<void> {
  const { error } = await supabase.from('week_plans').upsert({
    household_id: householdId,
    days: plan.days,
    total_meals: plan.totalMeals,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
}

export async function replaceShoppingItems(
  householdId: string,
  items: ShoppingItem[]
): Promise<ShoppingItem[]> {
  const { error: delError } = await supabase
    .from('shopping_items')
    .delete()
    .eq('household_id', householdId);
  if (delError) throw new Error(delError.message);

  if (items.length === 0) return [];

  const rows = items.map((item) => ({
    id: item.id,
    household_id: householdId,
    name: item.name,
    quantity: item.quantity,
    category: item.category,
    is_checked: item.isChecked,
    is_custom: Boolean(item.isCustom),
    updated_at: new Date().toISOString(),
  }));

  const { data, error } = await supabase.from('shopping_items').insert(rows).select('*');
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    quantity: (row.quantity as string) ?? '',
    category: row.category as IngredientCategory,
    isChecked: Boolean(row.is_checked),
    isCustom: Boolean(row.is_custom),
  }));
}

export function newLocalId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
