export type IngredientCategory = 'Supermercado' | 'Verdulería' | 'Carnicería' | 'Otros';

export interface Ingredient {
  name: string;
  quantity: string;
  category?: IngredientCategory;
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  category: IngredientCategory;
  isChecked: boolean;
  isCustom?: boolean;
}

export interface Instruction {
  step: number;
  text: string;
}

export interface Recipe {
  id: string;
  title: string;
  imageUrl: string;
  prepTime: string; // e.g. "15 min"
  servings?: number;
  tags: Tag[];
  isFavorite: boolean;
  source?: {
    name: string;
    url?: string;
  };
  ingredients?: Ingredient[];
  instructions?: Instruction[];
}

export interface Tag {
  label: string;
  color: 'mint' | 'violet' | 'orange' | 'lilac';
}

export interface MealSlot {
  type: 'Almuerzo' | 'Cena';
  recipeTitle?: string;
  imageUrl?: string;
  prepTime?: string;
}

export interface DayPlan {
  dayName: string;
  shortName: string; // "Lun", "Mar"
  slots: MealSlot[];
}

export interface WeekPlan {
  completedMeals: number;
  totalMeals: number;
  progressPercentage: number;
  days: DayPlan[];
}

export interface User {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
}

export interface HouseholdMember {
  userId: string;
  name: string;
  email?: string;
  role: 'owner' | 'member';
  joinedAt: string;
}

export interface Household {
  id: string;
  name: string;
  inviteCode: string;
  members: HouseholdMember[];
}
