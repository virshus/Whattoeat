import { Recipe, WeekPlan, User, Household } from './types';

export const mockUser: User = {
  id: 'user-alex',
  name: 'Alex',
  email: 'alex@whattoeat.app',
};

/** Nombre por defecto: "Menú de Alex", "Menú de Alex y Sam", etc. */
export function buildSharedMenuName(names: string[]): string {
  const clean = names.map((n) => n.trim()).filter(Boolean);
  if (clean.length === 0) return 'Menú compartido';
  if (clean.length === 1) return `Menú de ${clean[0]}`;
  if (clean.length === 2) return `Menú de ${clean[0]} y ${clean[1]}`;
  const last = clean[clean.length - 1];
  return `Menú de ${clean.slice(0, -1).join(', ')} y ${last}`;
}

/** Hogar inicial: solo el owner. Usar createHouseholdFromOwner / simulateSamJoin en la UI. */
export const mockHouseholdSolo: Household = {
  id: 'household-1',
  name: buildSharedMenuName([mockUser.name]),
  inviteCode: 'WTE-7K2M',
  members: [
    {
      userId: mockUser.id,
      name: mockUser.name,
      email: mockUser.email,
      role: 'owner',
      joinedAt: '2026-01-10',
    },
  ],
};

export const mockMemberSam = {
  userId: 'user-sam',
  name: 'Sam',
  email: 'sam@whattoeat.app',
  role: 'member' as const,
  joinedAt: new Date().toISOString().slice(0, 10),
};

export function createHouseholdFromOwner(owner: User, name?: string): Household {
  const code = `WTE-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  return {
    id: `household-${Date.now().toString(36)}`,
    name: name ?? buildSharedMenuName([owner.name]),
    inviteCode: code,
    members: [
      {
        userId: owner.id,
        name: owner.name,
        email: owner.email,
        role: 'owner',
        joinedAt: new Date().toISOString().slice(0, 10),
      },
    ],
  };
}

export function simulateSamJoin(household: Household): Household {
  if (household.members.some((m) => m.userId === mockMemberSam.userId)) {
    return household;
  }
  const prevDefault = buildSharedMenuName(household.members.map((m) => m.name));
  const members = [...household.members, { ...mockMemberSam }];
  const nextDefault = buildSharedMenuName(members.map((m) => m.name));
  return {
    ...household,
    members,
    name: household.name === prevDefault ? nextDefault : household.name,
  };
}

export const mockWeekPlan: WeekPlan = {
  completedMeals: 4,
  totalMeals: 10,
  progressPercentage: 40,
  days: [
    { 
      dayName: 'Lunes', 
      shortName: 'Lun', 
      slots: [
        { type: 'Almuerzo', recipeTitle: 'Ensalada de Quinoa', imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=256&auto=format&fit=crop', prepTime: '30 min' },
        { type: 'Cena', recipeTitle: 'Pasta con Pesto', imageUrl: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=256&auto=format&fit=crop', prepTime: '20 min' }
      ]
    },
    { 
      dayName: 'Martes', 
      shortName: 'Mar', 
      slots: [
        { type: 'Almuerzo', recipeTitle: 'Tacos de Pollo', imageUrl: 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?q=80&w=256&auto=format&fit=crop', prepTime: '25 min' },
        { type: 'Cena' }
      ]
    },
    { 
      dayName: 'Miércoles', 
      shortName: 'Mié', 
      slots: [{ type: 'Almuerzo' }, { type: 'Cena', recipeTitle: 'Salmón al Horno', imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=256&auto=format&fit=crop', prepTime: '25 min' }]
    },
    { 
      dayName: 'Jueves', 
      shortName: 'Jue', 
      slots: [
        { type: 'Almuerzo', recipeTitle: 'Ensalada de Quinoa', imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=256&auto=format&fit=crop', prepTime: '30 min' },
        { type: 'Cena' }
      ]
    },
    { 
      dayName: 'Viernes', 
      shortName: 'Vie', 
      slots: [{ type: 'Almuerzo' }, { type: 'Cena' }]
    },
  ]
};

export const mockRecipes: Recipe[] = [
  {
    id: '4',
    title: 'Tacos de Pollo',
    imageUrl: 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?q=80&w=800&auto=format&fit=crop',
    prepTime: '25 min',
    servings: 2,
    isFavorite: true,
    source: {
      name: 'Agregada desde Instagram',
      url: 'https://instagram.com/p/123'
    },
    ingredients: [
      { name: 'Pechuga de pollo', quantity: '1.5 kg', category: 'Carnicería' },
      { name: 'Tortillas de maíz', quantity: '9 un.', category: 'Supermercado' },
      { name: 'Cebolla morada', quantity: '1.5 un.', category: 'Verdulería' },
      { name: 'Cilantro fresco', quantity: 'Al gusto', category: 'Verdulería' },
      { name: 'Limas', quantity: '3 un.', category: 'Verdulería' }
    ],
    instructions: [
      { step: 1, text: 'Corta la pechuga de pollo en tiras o cubos pequeños. Sazona con sal, pimienta, y especias a tu gusto (comino, pimentón dulce, etc).' },
      { step: 2, text: 'Calienta una sartén con un chorrito de aceite de oliva. Dora el pollo a fuego medio-alto hasta que esté cocido y ligeramente crujiente.' },
      { step: 3, text: 'Calienta las tortillas de maíz en una plancha o sartén limpia, unos segundos por cada lado.' },
      { step: 4, text: 'Arma los tacos colocando el pollo sobre las tortillas calientes. Decora con cebolla morada picada finamente, hojas de cilantro y exprime jugo de lima por encima.' }
    ],
    tags: [
      { label: 'Rápido', color: 'violet' },
      { label: 'Proteico', color: 'orange' }
    ]
  },
  {
    id: '1',
    title: 'Pasta con Pesto',
    imageUrl: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=800&auto=format&fit=crop',
    prepTime: '20 min',
    isFavorite: true,
    tags: [
      { label: 'Vegetariano', color: 'mint' },
      { label: 'Rápido', color: 'violet' }
    ],
    ingredients: [
      { name: 'Pasta', quantity: '500g', category: 'Supermercado' },
      { name: 'Albahaca fresca', quantity: '1 atado', category: 'Verdulería' },
      { name: 'Ajo', quantity: '2 dientes', category: 'Verdulería' },
      { name: 'Queso parmesano', quantity: '100g', category: 'Supermercado' },
      { name: 'Aceite de oliva', quantity: '50ml', category: 'Supermercado' },
      { name: 'Nueces', quantity: '50g', category: 'Supermercado' }
    ]
  },
  {
    id: '2',
    title: 'Ensalada de Quinoa',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop',
    prepTime: '30 min',
    isFavorite: true,
    tags: [
      { label: 'Vegetariano', color: 'mint' },
      { label: 'Saludable', color: 'orange' }
    ],
    ingredients: [
      { name: 'Quinoa', quantity: '200g', category: 'Supermercado' },
      { name: 'Tomates cherry', quantity: '250g', category: 'Verdulería' },
      { name: 'Pepino', quantity: '1 un.', category: 'Verdulería' },
      { name: 'Cebolla morada', quantity: '1 un.', category: 'Verdulería' },
      { name: 'Aceite de oliva', quantity: '30ml', category: 'Supermercado' }
    ]
  },
  {
    id: '3',
    title: 'Salmón al Horno',
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=800&auto=format&fit=crop',
    prepTime: '25 min',
    isFavorite: true,
    tags: [
      { label: 'Proteína', color: 'lilac' },
      { label: 'Rápido', color: 'violet' }
    ],
    ingredients: [
      { name: 'Salmón fresco', quantity: '500g', category: 'Pescadería' },
      { name: 'Limas', quantity: '2 un.', category: 'Verdulería' },
      { name: 'Ajo', quantity: '2 dientes', category: 'Verdulería' },
      { name: 'Espárragos', quantity: '1 atado', category: 'Verdulería' }
    ]
  }
];

export const mockIngredientsCount = 12;

/** Datos vacíos para probar empty states. Usar en App.tsx reemplazando mockWeekPlan / mockRecipes. */
export const emptyRecipes: Recipe[] = [];

export const emptyWeekPlan: WeekPlan = {
  completedMeals: 0,
  totalMeals: 10,
  progressPercentage: 0,
  days: [
    { dayName: 'Lunes', shortName: 'Lun', slots: [{ type: 'Almuerzo' }, { type: 'Cena' }] },
    { dayName: 'Martes', shortName: 'Mar', slots: [{ type: 'Almuerzo' }, { type: 'Cena' }] },
    { dayName: 'Miércoles', shortName: 'Mié', slots: [{ type: 'Almuerzo' }, { type: 'Cena' }] },
    { dayName: 'Jueves', shortName: 'Jue', slots: [{ type: 'Almuerzo' }, { type: 'Cena' }] },
    { dayName: 'Viernes', shortName: 'Vie', slots: [{ type: 'Almuerzo' }, { type: 'Cena' }] },
  ],
};
