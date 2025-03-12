import { FoodItem } from './foodDatabase';

const API_URL = 'https://world.openfoodfacts.org/';

export async function searchOpenFoodFacts(query: string): Promise<FoodItem[]> {
  try {
    const searchUrl = `${API_URL}?search_terms=${encodeURIComponent(query)}&json=1&page_size=20`;
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    if (!data.products) return [];
    
    return data.products.map(product => ({
      id: `off_${product.code}`,
      name: product.product_name || 'Unknown Product',
      brandName: product.brands,
      servingSize: product.serving_size || '100g',
      calories: parseFloat(product.nutriments['energy-kcal_100g']) || 0,
      protein: parseFloat(product.nutriments.proteins_100g) || 0,
      carbs: parseFloat(product.nutriments.carbohydrates_100g) || 0,
      fat: parseFloat(product.nutriments.fat_100g) || 0,
      fiber: parseFloat(product.nutriments.fiber_100g),
      sugar: parseFloat(product.nutriments.sugars_100g),
      sodium: parseFloat(product.nutriments.sodium_100g),
      category: product.categories?.split(',')[0] || 'Other',
      imageUrl: product.image_url
    }));
  } catch (error) {
    console.error('Error fetching from OpenFoodFacts:', error);
    return [];
  }
}
