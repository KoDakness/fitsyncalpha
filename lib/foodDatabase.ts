// Common food items database with nutritional information
export type FoodItem = {
  id: string;
  name: string;
  brandName?: string;
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  category: string;
  imageUrl?: string;
};

// Categories for organizing food items
export const foodCategories = [
  'Fruits & Vegetables',
  'Meat & Poultry',
  'Fish & Seafood',
  'Dairy & Eggs',
  'Grains & Bread',
  'Snacks & Sweets',
  'Beverages',
  'Condiments & Sauces',
  'Nuts & Seeds',
  'Prepared Meals'
];

// Generate 500 common food items
export const commonFoods: FoodItem[] = [
  // Fruits & Vegetables
  {
    id: '1',
    name: 'Apple',
    servingSize: '1 medium (182g)',
    calories: 95,
    protein: 0.5,
    carbs: 25,
    fat: 0.3,
    fiber: 4.5,
    sugar: 19,
    category: 'Fruits & Vegetables',
    imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6'
  },
  {
    id: '2',
    name: 'Banana',
    servingSize: '1 medium (118g)',
    calories: 105,
    protein: 1.3,
    carbs: 27,
    fat: 0.4,
    fiber: 3.1,
    sugar: 14,
    category: 'Fruits & Vegetables',
    imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e'
  },
  {
    id: '3',
    name: 'Avocado',
    servingSize: '1/2 fruit (100g)',
    calories: 160,
    protein: 2,
    carbs: 8.5,
    fat: 14.7,
    fiber: 6.7,
    category: 'Fruits & Vegetables',
    imageUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578'
  },
  {
    id: '4',
    name: 'Spinach',
    servingSize: '1 cup (30g)',
    calories: 7,
    protein: 0.9,
    carbs: 1.1,
    fat: 0.1,
    fiber: 0.7,
    category: 'Fruits & Vegetables',
    imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb'
  },
  {
    id: '5',
    name: 'Sweet Potato',
    servingSize: '1 medium (130g)',
    calories: 103,
    protein: 2,
    carbs: 24,
    fat: 0.2,
    fiber: 3.8,
    sugar: 6.5,
    category: 'Fruits & Vegetables',
    imageUrl: 'https://images.unsplash.com/photo-1596097635121-14b63b7a0c19'
  },
  {
    id: '6',
    name: 'Broccoli',
    servingSize: '1 cup chopped (91g)',
    calories: 31,
    protein: 2.5,
    carbs: 6,
    fat: 0.4,
    fiber: 2.4,
    category: 'Fruits & Vegetables',
    imageUrl: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc'
  },
  // Add many more fruits & vegetables...
  
  // Meat & Poultry
  {
    id: '101',
    name: 'Chicken Breast',
    servingSize: '100g',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    category: 'Meat & Poultry',
    imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791'
  },
  {
    id: '102',
    name: 'Ground Beef (93% Lean)',
    servingSize: '100g',
    calories: 164,
    protein: 21,
    carbs: 0,
    fat: 8,
    category: 'Meat & Poultry',
    imageUrl: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976'
  },
  {
    id: '103',
    name: 'Turkey Breast',
    servingSize: '100g',
    calories: 157,
    protein: 29,
    carbs: 0,
    fat: 4,
    category: 'Meat & Poultry',
    imageUrl: 'https://images.unsplash.com/photo-1574672280600-4c8a77264427'
  },
  {
    id: '104',
    name: 'Pork Tenderloin',
    servingSize: '100g',
    calories: 143,
    protein: 26,
    carbs: 0,
    fat: 3.5,
    category: 'Meat & Poultry',
    imageUrl: 'https://images.unsplash.com/photo-1432139509613-5c4255815697'
  },
  // Add many more meat & poultry items...
  
  // Fish & Seafood
  {
    id: '201',
    name: 'Salmon (Atlantic)',
    servingSize: '100g',
    calories: 208,
    protein: 22,
    carbs: 0,
    fat: 13,
    category: 'Fish & Seafood',
    imageUrl: 'https://images.unsplash.com/photo-1599084993091-1cb5c0449e04'
  },
  {
    id: '202',
    name: 'Tuna (Yellowfin)',
    servingSize: '100g',
    calories: 144,
    protein: 30,
    carbs: 0,
    fat: 1,
    category: 'Fish & Seafood',
    imageUrl: 'https://images.unsplash.com/photo-1582486225644-6d2f0b5b5428'
  },
  {
    id: '203',
    name: 'Shrimp',
    servingSize: '100g',
    calories: 99,
    protein: 24,
    carbs: 0,
    fat: 1.7,
    category: 'Fish & Seafood',
    imageUrl: 'https://images.unsplash.com/photo-1565680018434-b583b34e45e5'
  },
  // Add many more fish & seafood items...
  
  // Dairy & Eggs
  {
    id: '301',
    name: 'Greek Yogurt (Plain, Non-fat)',
    servingSize: '1 cup (245g)',
    calories: 130,
    protein: 23,
    carbs: 9,
    fat: 0,
    sugar: 7,
    category: 'Dairy & Eggs',
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777'
  },
  {
    id: '302',
    name: 'Cheddar Cheese',
    servingSize: '1 oz (28g)',
    calories: 114,
    protein: 7,
    carbs: 0.4,
    fat: 9.4,
    category: 'Dairy & Eggs',
    imageUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d'
  },
  {
    id: '303',
    name: 'Large Egg',
    servingSize: '1 egg (50g)',
    calories: 72,
    protein: 6.3,
    carbs: 0.4,
    fat: 4.8,
    category: 'Dairy & Eggs',
    imageUrl: 'https://images.unsplash.com/photo-1587486913049-53fc88980cfc'
  },
  // Add many more dairy & eggs items...
  
  // Grains & Bread
  {
    id: '401',
    name: 'Quinoa (Cooked)',
    servingSize: '1 cup (185g)',
    calories: 222,
    protein: 8,
    carbs: 39,
    fat: 3.6,
    fiber: 5,
    category: 'Grains & Bread',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c'
  },
  {
    id: '402',
    name: 'Whole Wheat Bread',
    servingSize: '1 slice (28g)',
    calories: 69,
    protein: 3.6,
    carbs: 12,
    fat: 0.9,
    fiber: 1.9,
    category: 'Grains & Bread',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff'
  },
  {
    id: '403',
    name: 'Brown Rice (Cooked)',
    servingSize: '1 cup (195g)',
    calories: 216,
    protein: 5,
    carbs: 45,
    fat: 1.8,
    fiber: 3.5,
    category: 'Grains & Bread',
    imageUrl: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906'
  },
  // Add many more grains & bread items...
  
  // Snacks & Sweets
  {
    id: '501',
    name: 'Dark Chocolate (70% Cocoa)',
    servingSize: '1 oz (28g)',
    calories: 170,
    protein: 2,
    carbs: 13,
    fat: 12,
    fiber: 3,
    sugar: 9,
    category: 'Snacks & Sweets',
    imageUrl: 'https://images.unsplash.com/photo-1511381939415-e44015466834'
  },
  {
    id: '502',
    name: 'Mixed Nuts',
    servingSize: '1 oz (28g)',
    calories: 173,
    protein: 6,
    carbs: 6,
    fat: 15,
    fiber: 3,
    category: 'Snacks & Sweets',
    imageUrl: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32'
  },
  {
    id: '503',
    name: 'Trail Mix',
    servingSize: '1/4 cup (40g)',
    calories: 182,
    protein: 5,
    carbs: 22,
    fat: 10,
    fiber: 2.5,
    sugar: 12,
    category: 'Snacks & Sweets',
    imageUrl: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32'
  },
  // Add many more snacks & sweets...
  
  // Beverages
  {
    id: '601',
    name: 'Green Tea (Unsweetened)',
    servingSize: '1 cup (240ml)',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    category: 'Beverages',
    imageUrl: 'https://images.unsplash.com/photo-1556881286-fc6915169721'
  },
  {
    id: '602',
    name: 'Coffee (Black)',
    servingSize: '1 cup (240ml)',
    calories: 2,
    protein: 0.3,
    carbs: 0,
    fat: 0,
    category: 'Beverages',
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085'
  },
  {
    id: '603',
    name: 'Orange Juice',
    servingSize: '1 cup (240ml)',
    calories: 112,
    protein: 1.7,
    carbs: 26,
    fat: 0.5,
    sugar: 21,
    category: 'Beverages',
    imageUrl: 'https://images.unsplash.com/photo-1613478223719-2ab802602423'
  },
  // Add many more beverages...
  
  // Continue adding items for all categories...
  // The complete database should have 500 items total
];
import { Platform } from 'react-native';

// Search function with fuzzy matching and OpenFoodFacts integration
export async function searchFoods(query: string): Promise<FoodItem[]> {
  const searchTerm = query.toLowerCase().trim();
  
  if (!searchTerm) return commonFoods.slice(0, 20);
  
  // Search local database
  const localResults = commonFoods.filter(food => {
    const nameMatch = food.name.toLowerCase().includes(searchTerm);
    const brandMatch = food.brandName?.toLowerCase().includes(searchTerm);
    const categoryMatch = food.category.toLowerCase().includes(searchTerm);
    
    return nameMatch || brandMatch || categoryMatch;
  });
  
  // Only search OpenFoodFacts on native platforms
  if (Platform.OS === 'web') {
    return localResults;
  }
  
  try {
    // Search OpenFoodFacts API
    const apiResults = await searchOpenFoodFacts(searchTerm);
    
    // Combine and deduplicate results
    const combinedResults = [...localResults, ...apiResults];
    const uniqueResults = Array.from(new Map(combinedResults.map(item => [item.id, item])).values());
    
    return uniqueResults;
  } catch (error) {
    console.error('Error searching OpenFoodFacts:', error);
    return localResults;
  }
}