import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category, Dish, MenuStats, Variant, CustomizationGroup, AddOn, DietaryType } from '../types/menu';

const STORAGE_KEY = '@myquro_restaurant_menu_v1';

export interface MenuStoreState {
  categories: Category[];
  dishes: Dish[];
  isLoading: boolean;
  searchQuery: string;
  selectedFilter: 'All' | 'Available' | 'Unavailable' | 'Veg' | 'Non-Veg' | 'With Variants' | 'With Add-ons';
  selectedDishIdsForBulk: string[];
  
  // Category Actions
  loadMenu: () => Promise<void>;
  addCategory: (category: Omit<Category, 'id' | 'createdAt' | 'displayOrder'>) => Promise<Category>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  reorderCategories: (orderedIds: string[]) => Promise<void>;
  toggleCategoryStatus: (id: string) => Promise<void>;

  // Dish Actions
  addDish: (dish: Omit<Dish, 'id' | 'createdAt' | 'displayOrder'>) => Promise<Dish>;
  updateDish: (id: string, updates: Partial<Dish>) => Promise<void>;
  deleteDish: (id: string) => Promise<void>;
  duplicateDish: (id: string) => Promise<Dish | null>;
  toggleDishAvailability: (id: string) => Promise<void>;
  reorderDishes: (categoryId: string, orderedIds: string[]) => Promise<void>;
  bulkUpdateDishStatus: (dishIds: string[], isAvailable: boolean) => Promise<void>;
  bulkDeleteDishes: (dishIds: string[]) => Promise<void>;

  // Selection & Filters
  setSearchQuery: (query: string) => void;
  setSelectedFilter: (filter: MenuStoreState['selectedFilter']) => void;
  toggleSelectDishForBulk: (dishId: string) => void;
  selectAllDishesForBulk: (dishIds: string[]) => void;
  clearBulkSelection: () => void;

  // Helpers
  getMenuStats: () => MenuStats;
  getDishesByCategory: (categoryId: string) => Dish[];
  getFilteredDishes: () => Dish[];
  isDishAvailableNow: (dish: Dish) => boolean;
  resetToDefaultMenu: () => Promise<void>;
}

// Initial Rich Default Seed Data
const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat-ice-cream',
    name: 'Ice Cream',
    description: 'Artisanal hand-churned scoops, sundaes & frozen treats',
    icon: '🍦',
    isActive: true,
    displayOrder: 0,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'cat-burgers',
    name: 'Burgers',
    description: 'Juicy gourmet brioche burgers crafted with fresh patties',
    icon: '🍔',
    isActive: true,
    displayOrder: 1,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'cat-pizzas',
    name: 'Pizzas',
    description: 'Wood-fired sourdough pizzas with artisanal toppings',
    icon: '🍕',
    isActive: true,
    displayOrder: 2,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'cat-beverages',
    name: 'Beverages & Shakes',
    description: 'Thick cold shakes, iced coolers, and fresh mocktails',
    icon: '🥤',
    isActive: true,
    displayOrder: 3,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'cat-snacks',
    name: 'Snacks & Sides',
    description: 'Crispy finger foods, loaded fries and appetizers',
    icon: '🍟',
    isActive: true,
    displayOrder: 4,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

const DEFAULT_DISHES: Dish[] = [
  // 1. Butterscotch (From master prompt example)
  {
    id: 'dish-butterscotch',
    categoryId: 'cat-ice-cream',
    name: 'Butterscotch',
    description: 'Creamy butterscotch ice cream topped with crunchy golden caramel pieces.',
    dietaryType: 'veg',
    image: 'https://images.unsplash.com/photo-1560008581-09826d1de69e?w=600&auto=format&fit=crop&q=80',
    basePrice: 120,
    hasVariants: true,
    variants: [
      {
        id: 'var-bs-small',
        name: 'Small',
        price: 80,
        portion: '1 Scoop (100g)',
        description: 'Single scoop of classic butterscotch',
        isAvailable: true,
        displayOrder: 0,
      },
      {
        id: 'var-bs-regular',
        name: 'Regular',
        price: 120,
        portion: '2 Scoops (200g)',
        description: 'Double scoop in a waffle cup',
        isAvailable: true,
        displayOrder: 1,
      },
      {
        id: 'var-bs-large',
        name: 'Large',
        price: 160,
        portion: '3 Scoops (300g)',
        description: 'Triple scoop sundae tub',
        isAvailable: true,
        displayOrder: 2,
      },
    ],
    customizationGroups: [
      {
        id: 'grp-bs-extras',
        name: 'Add Extras & Toppings',
        isRequired: false,
        minSelections: 0,
        maxSelections: 4,
        type: 'multi',
        addOns: [
          { id: 'addon-choc-syrup', name: 'Chocolate Syrup', price: 20, isAvailable: true, displayOrder: 0 },
          { id: 'addon-choco-chips', name: 'Choco Chips', price: 25, isAvailable: true, displayOrder: 1 },
          { id: 'addon-nuts', name: 'Roasted Almond & Cashew Nuts', price: 30, isAvailable: true, displayOrder: 2 },
          { id: 'addon-whipped-cream', name: 'Whipped Cream', price: 20, isAvailable: true, displayOrder: 3 },
        ],
      },
    ],
    isAvailable: true,
    hasSchedule: false,
    displayOrder: 0,
    createdAt: new Date().toISOString(),
  },
  // 2. Belgian Dark Chocolate Sundae
  {
    id: 'dish-belgian-choc',
    categoryId: 'cat-ice-cream',
    name: 'Belgian Dark Chocolate Sundae',
    description: '70% dark Belgian cocoa infused with rich fudge swirl and chocolate brownie bites.',
    dietaryType: 'veg',
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&auto=format&fit=crop&q=80',
    basePrice: 140,
    hasVariants: true,
    variants: [
      { id: 'var-choc-reg', name: 'Regular', price: 140, portion: '2 Scoops', isAvailable: true, displayOrder: 0 },
      { id: 'var-choc-fam', name: 'Family Tub', price: 240, portion: '500 ml', isAvailable: true, displayOrder: 1 },
    ],
    customizationGroups: [
      {
        id: 'grp-choc-toppings',
        name: 'Gourmet Toppings',
        isRequired: false,
        minSelections: 0,
        maxSelections: 3,
        type: 'multi',
        addOns: [
          { id: 'addon-hot-fudge', name: 'Warm Hot Fudge', price: 35, isAvailable: true, displayOrder: 0 },
          { id: 'addon-brownie-crush', name: 'Crushed Brownie', price: 40, isAvailable: true, displayOrder: 1 },
        ],
      },
    ],
    isAvailable: true,
    hasSchedule: false,
    displayOrder: 1,
    createdAt: new Date().toISOString(),
  },
  // 3. Signature Crispy Veg Burger
  {
    id: 'dish-crispy-veg-burger',
    categoryId: 'cat-burgers',
    name: 'Signature Crispy Veg Burger',
    description: 'Crispy herb potato patty topped with tangy chipotle mayo, fresh lettuce, and pickled gherkins.',
    dietaryType: 'veg',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    basePrice: 169,
    hasVariants: true,
    variants: [
      { id: 'var-veg-single', name: 'Single Patty', price: 169, portion: 'Standard', isAvailable: true, displayOrder: 0 },
      { id: 'var-veg-double', name: 'Double Patty Deluxe', price: 219, portion: 'Double Patty', isAvailable: true, displayOrder: 1 },
      { id: 'var-veg-meal', name: 'Combo Meal (Burger + Fries + Coke)', price: 279, portion: 'Full Combo', isAvailable: true, displayOrder: 2 },
    ],
    customizationGroups: [
      {
        id: 'grp-burger-addons',
        name: 'Add Extras',
        isRequired: false,
        minSelections: 0,
        maxSelections: 3,
        type: 'multi',
        addOns: [
          { id: 'addon-cheese-slice', name: 'Melted Cheddar Cheese Slice', price: 30, isAvailable: true, displayOrder: 0 },
          { id: 'addon-jalapeno', name: 'Spicy Jalapeño Poppers', price: 25, isAvailable: true, displayOrder: 1 },
          { id: 'addon-caramelized-onion', name: 'Caramelized Butter Onions', price: 20, isAvailable: true, displayOrder: 2 },
        ],
      },
    ],
    isAvailable: true,
    hasSchedule: false,
    displayOrder: 0,
    createdAt: new Date().toISOString(),
  },
  // 4. Grilled Smoky Chicken Crunch Burger
  {
    id: 'dish-chicken-burger',
    categoryId: 'cat-burgers',
    name: 'Smoky Grilled Chicken Crunch',
    description: 'Char-grilled succulent chicken thigh fillet brushed with hickory BBQ sauce and melted Monterey Jack.',
    dietaryType: 'non-veg',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80',
    basePrice: 229,
    hasVariants: true,
    variants: [
      { id: 'var-chk-reg', name: 'Regular', price: 229, portion: '1 Fillet', isAvailable: true, displayOrder: 0 },
      { id: 'var-chk-meal', name: 'Crunch Meal (Burger + Peri Peri Fries + Soft Drink)', price: 339, portion: 'Full Meal', isAvailable: true, displayOrder: 1 },
    ],
    customizationGroups: [
      {
        id: 'grp-chk-cheese',
        name: 'Choose Cheese Type',
        isRequired: true,
        minSelections: 1,
        maxSelections: 1,
        type: 'single',
        addOns: [
          { id: 'addon-monterey', name: 'Monterey Jack Cheese', price: 0, isAvailable: true, displayOrder: 0 },
          { id: 'addon-smoked-gouda', name: 'Smoked Gouda Cheese', price: 25, isAvailable: true, displayOrder: 1 },
        ],
      },
      {
        id: 'grp-chk-extras',
        name: 'Extra Toppings',
        isRequired: false,
        minSelections: 0,
        maxSelections: 2,
        type: 'multi',
        addOns: [
          { id: 'addon-crispy-bacon', name: 'Crispy Chicken Rashers', price: 50, isAvailable: true, displayOrder: 0 },
          { id: 'addon-fried-egg', name: 'Fried Sunny Egg', price: 30, isAvailable: true, displayOrder: 1 },
        ],
      },
    ],
    isAvailable: true,
    hasSchedule: false,
    displayOrder: 1,
    createdAt: new Date().toISOString(),
  },
  // 5. Wood-Fired Margherita Pizza
  {
    id: 'dish-margherita',
    categoryId: 'cat-pizzas',
    name: 'Classic Margherita Pizza',
    description: 'San Marzano tomato coulis, fresh buffalo mozzarella, virgin olive oil, and sweet Italian basil.',
    dietaryType: 'veg',
    image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600&auto=format&fit=crop&q=80',
    basePrice: 269,
    hasVariants: true,
    variants: [
      { id: 'var-piz-med', name: 'Medium (8 inch)', price: 269, portion: 'Serves 1-2', isAvailable: true, displayOrder: 0 },
      { id: 'var-piz-large', name: 'Large (12 inch)', price: 429, portion: 'Serves 2-3', isAvailable: true, displayOrder: 1 },
    ],
    customizationGroups: [
      {
        id: 'grp-crust',
        name: 'Choose Crust Style',
        isRequired: true,
        minSelections: 1,
        maxSelections: 1,
        type: 'single',
        addOns: [
          { id: 'addon-crust-thin', name: 'Neapolitan Thin Crust', price: 0, isAvailable: true, displayOrder: 0 },
          { id: 'addon-crust-cheese-burst', name: 'Cheese Burst Stuffed Crust', price: 79, isAvailable: true, displayOrder: 1 },
        ],
      },
    ],
    isAvailable: true,
    hasSchedule: false,
    displayOrder: 0,
    createdAt: new Date().toISOString(),
  },
  // 6. Breakfast Masala Chai (Scheduled Item Example)
  {
    id: 'dish-masala-chai',
    categoryId: 'cat-beverages',
    name: 'Kulhad Masala Chai & Maska Bun',
    description: 'Freshly brewed aromatic ginger-cardamom tea served with warm buttered bun.',
    dietaryType: 'veg',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
    basePrice: 70,
    hasVariants: false,
    variants: [],
    customizationGroups: [],
    isAvailable: true,
    hasSchedule: true,
    scheduleStartTime: '07:00',
    scheduleEndTime: '11:30',
    displayOrder: 0,
    createdAt: new Date().toISOString(),
  },
  // 7. Peri Peri French Fries
  {
    id: 'dish-peri-peri-fries',
    categoryId: 'cat-snacks',
    name: 'Crispy Peri Peri Crinkle Fries',
    description: 'Golden potato crinkle fries tossed in fiery African peri peri spice blend, served with garlic dip.',
    dietaryType: 'vegan',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80',
    basePrice: 119,
    hasVariants: true,
    variants: [
      { id: 'var-fries-reg', name: 'Regular Tub', price: 119, portion: '150g', isAvailable: true, displayOrder: 0 },
      { id: 'var-fries-large', name: 'Jumbo Sharing Tub', price: 179, portion: '300g', isAvailable: true, displayOrder: 1 },
    ],
    customizationGroups: [
      {
        id: 'grp-dips',
        name: 'Extra Dips',
        isRequired: false,
        minSelections: 0,
        maxSelections: 2,
        type: 'multi',
        addOns: [
          { id: 'addon-cheese-dip', name: 'Warm Cheddar Cheese Dip', price: 30, isAvailable: true, displayOrder: 0 },
          { id: 'addon-chipotle-dip', name: 'Smoky Chipotle Mayo', price: 25, isAvailable: true, displayOrder: 1 },
        ],
      },
    ],
    isAvailable: true,
    hasSchedule: false,
    displayOrder: 0,
    createdAt: new Date().toISOString(),
  },
];

export const useMenuStore = create<MenuStoreState>((set, get) => ({
  categories: [],
  dishes: [],
  isLoading: true,
  searchQuery: '',
  selectedFilter: 'All',
  selectedDishIdsForBulk: [],

  loadMenu: async () => {
    set({ isLoading: true });
    try {
      const dataStr = await AsyncStorage.getItem(STORAGE_KEY);
      if (dataStr) {
        const parsed = JSON.parse(dataStr);
        set({
          categories: parsed.categories || DEFAULT_CATEGORIES,
          dishes: parsed.dishes || DEFAULT_DISHES,
          isLoading: false,
        });
      } else {
        // First run: save and load default seed database
        const initialData = {
          categories: DEFAULT_CATEGORIES,
          dishes: DEFAULT_DISHES,
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
        set({
          categories: DEFAULT_CATEGORIES,
          dishes: DEFAULT_DISHES,
          isLoading: false,
        });
      }
    } catch (e) {
      console.error('Error loading menu from AsyncStorage:', e);
      set({ categories: DEFAULT_CATEGORIES, dishes: DEFAULT_DISHES, isLoading: false });
    }
  },

  // ---------------- Category Actions ----------------
  addCategory: async (catData) => {
    const categories = get().categories;
    const newCategory: Category = {
      ...catData,
      id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      displayOrder: categories.length,
      createdAt: new Date().toISOString(),
    };
    const updated = [...categories, newCategory];
    set({ categories: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ categories: updated, dishes: get().dishes }));
    return newCategory;
  },

  updateCategory: async (id, updates) => {
    const updated = get().categories.map((c) => (c.id === id ? { ...c, ...updates } : c));
    set({ categories: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ categories: updated, dishes: get().dishes }));
  },

  deleteCategory: async (id) => {
    const updatedCats = get().categories.filter((c) => c.id !== id);
    const updatedDishes = get().dishes.filter((d) => d.categoryId !== id);
    set({ categories: updatedCats, dishes: updatedDishes });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ categories: updatedCats, dishes: updatedDishes }));
  },

  reorderCategories: async (orderedIds) => {
    const categoriesMap = new Map(get().categories.map((c) => [c.id, c]));
    const reordered: Category[] = [];
    orderedIds.forEach((id, index) => {
      const cat = categoriesMap.get(id);
      if (cat) {
        reordered.push({ ...cat, displayOrder: index });
      }
    });
    set({ categories: reordered });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ categories: reordered, dishes: get().dishes }));
  },

  toggleCategoryStatus: async (id) => {
    const updated = get().categories.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c));
    set({ categories: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ categories: updated, dishes: get().dishes }));
  },

  // ---------------- Dish Actions ----------------
  addDish: async (dishData) => {
    const dishes = get().dishes;
    const categoryDishes = dishes.filter((d) => d.categoryId === dishData.categoryId);
    const newDish: Dish = {
      ...dishData,
      id: `dish-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      displayOrder: categoryDishes.length,
      createdAt: new Date().toISOString(),
    };
    const updated = [...dishes, newDish];
    set({ dishes: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ categories: get().categories, dishes: updated }));
    return newDish;
  },

  updateDish: async (id, updates) => {
    const updated = get().dishes.map((d) =>
      d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d
    );
    set({ dishes: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ categories: get().categories, dishes: updated }));
  },

  deleteDish: async (id) => {
    const updated = get().dishes.filter((d) => d.id !== id);
    set({ dishes: updated, selectedDishIdsForBulk: get().selectedDishIdsForBulk.filter((bid) => bid !== id) });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ categories: get().categories, dishes: updated }));
  },

  duplicateDish: async (id) => {
    const original = get().dishes.find((d) => d.id === id);
    if (!original) return null;

    // Deep clone variants with fresh unique IDs
    const clonedVariants: Variant[] = original.variants.map((v, i) => ({
      ...v,
      id: `var-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
    }));

    // Deep clone customization groups & add-ons with fresh unique IDs
    const clonedGroups: CustomizationGroup[] = original.customizationGroups.map((g, gi) => ({
      ...g,
      id: `grp-${Date.now()}-${gi}-${Math.random().toString(36).substr(2, 4)}`,
      addOns: g.addOns.map((a, ai) => ({
        ...a,
        id: `addon-${Date.now()}-${gi}-${ai}-${Math.random().toString(36).substr(2, 4)}`,
      })),
    }));

    const categoryDishes = get().dishes.filter((d) => d.categoryId === original.categoryId);
    const duplicatedDish: Dish = {
      ...original,
      id: `dish-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: `${original.name} (Copy)`,
      variants: clonedVariants,
      customizationGroups: clonedGroups,
      displayOrder: categoryDishes.length,
      createdAt: new Date().toISOString(),
      updatedAt: undefined,
    };

    const updated = [...get().dishes, duplicatedDish];
    set({ dishes: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ categories: get().categories, dishes: updated }));
    return duplicatedDish;
  },

  toggleDishAvailability: async (id) => {
    const updated = get().dishes.map((d) => (d.id === id ? { ...d, isAvailable: !d.isAvailable } : d));
    set({ dishes: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ categories: get().categories, dishes: updated }));
  },

  reorderDishes: async (categoryId, orderedIds) => {
    const nonCatDishes = get().dishes.filter((d) => d.categoryId !== categoryId);
    const catDishesMap = new Map(get().dishes.filter((d) => d.categoryId === categoryId).map((d) => [d.id, d]));

    const reorderedCatDishes: Dish[] = [];
    orderedIds.forEach((id, index) => {
      const dish = catDishesMap.get(id);
      if (dish) {
        reorderedCatDishes.push({ ...dish, displayOrder: index });
      }
    });

    const updated = [...nonCatDishes, ...reorderedCatDishes];
    set({ dishes: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ categories: get().categories, dishes: updated }));
  },

  bulkUpdateDishStatus: async (dishIds, isAvailable) => {
    const idSet = new Set(dishIds);
    const updated = get().dishes.map((d) => (idSet.has(d.id) ? { ...d, isAvailable } : d));
    set({ dishes: updated, selectedDishIdsForBulk: [] });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ categories: get().categories, dishes: updated }));
  },

  bulkDeleteDishes: async (dishIds) => {
    const idSet = new Set(dishIds);
    const updated = get().dishes.filter((d) => !idSet.has(d.id));
    set({ dishes: updated, selectedDishIdsForBulk: [] });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ categories: get().categories, dishes: updated }));
  },

  // ---------------- Selection & Filters ----------------
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedFilter: (filter) => set({ selectedFilter: filter }),

  toggleSelectDishForBulk: (dishId) => {
    const current = get().selectedDishIdsForBulk;
    if (current.includes(dishId)) {
      set({ selectedDishIdsForBulk: current.filter((id) => id !== dishId) });
    } else {
      set({ selectedDishIdsForBulk: [...current, dishId] });
    }
  },

  selectAllDishesForBulk: (dishIds) => {
    set({ selectedDishIdsForBulk: dishIds });
  },

  clearBulkSelection: () => {
    set({ selectedDishIdsForBulk: [] });
  },

  // ---------------- Helpers ----------------
  getMenuStats: () => {
    const categories = get().categories;
    const dishes = get().dishes;
    const isDishAvailableNow = get().isDishAvailableNow;

    const totalCategories = categories.length;
    const totalDishes = dishes.length;
    const activeDishes = dishes.filter((d) => d.isAvailable && isDishAvailableNow(d)).length;
    const inactiveDishes = dishes.filter((d) => !d.isAvailable).length;
    const unavailableToday = dishes.filter((d) => !d.isAvailable || !isDishAvailableNow(d)).length;

    return {
      totalCategories,
      totalDishes,
      activeDishes,
      inactiveDishes,
      unavailableToday,
    };
  },

  getDishesByCategory: (categoryId) => {
    return get()
      .dishes.filter((d) => d.categoryId === categoryId)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  },

  isDishAvailableNow: (dish: Dish) => {
    if (!dish.isAvailable) return false;
    if (!dish.hasSchedule || !dish.scheduleStartTime || !dish.scheduleEndTime) return true;

    try {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const [startHour, startMin] = dish.scheduleStartTime.split(':').map(Number);
      const [endHour, endMin] = dish.scheduleEndTime.split(':').map(Number);

      const startMinutes = startHour * 60 + (startMin || 0);
      const endMinutes = endHour * 60 + (endMin || 0);

      if (startMinutes <= endMinutes) {
        return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
      } else {
        // Overnight schedule
        return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
      }
    } catch {
      return true;
    }
  },

  getFilteredDishes: () => {
    const { dishes, categories, searchQuery, selectedFilter } = get();
    const query = searchQuery.trim().toLowerCase();

    // Map category ID to category name for search
    const categoryNameMap = new Map(categories.map((c) => [c.id, c.name.toLowerCase()]));

    return dishes.filter((dish) => {
      // 1. Search Query filter (Dish name, Category, Description)
      if (query) {
        const catName = categoryNameMap.get(dish.categoryId) || '';
        const matchName = dish.name.toLowerCase().includes(query);
        const matchCat = catName.includes(query);
        const matchDesc = dish.description ? dish.description.toLowerCase().includes(query) : false;
        if (!matchName && !matchCat && !matchDesc) return false;
      }

      // 2. Filter chip
      switch (selectedFilter) {
        case 'Available':
          return dish.isAvailable;
        case 'Unavailable':
          return !dish.isAvailable;
        case 'Veg':
          return dish.dietaryType === 'veg' || dish.dietaryType === 'vegan';
        case 'Non-Veg':
          return dish.dietaryType === 'non-veg';
        case 'With Variants':
          return dish.hasVariants && dish.variants.length > 0;
        case 'With Add-ons':
          return dish.customizationGroups.some((g) => g.addOns.length > 0);
        case 'All':
        default:
          return true;
      }
    });
  },

  resetToDefaultMenu: async () => {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ categories: DEFAULT_CATEGORIES, dishes: DEFAULT_DISHES })
    );
    set({ categories: DEFAULT_CATEGORIES, dishes: DEFAULT_DISHES, selectedDishIdsForBulk: [] });
  },
}));
