import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Image, Platform } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Search, Barcode, Plus } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import BarcodeScanner from '@/components/BarcodeScanner';
import WorkoutLogForm from '@/components/WorkoutLogForm';
import { searchFoods, type FoodItem } from '@/lib/foodDatabase';
import ProductInfo from '@/components/ProductInfo';
import CustomFoodForm from '@/components/CustomFoodForm';

export default function LogScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('meal'); // 'meal', 'workout', or 'water'
  const [showScanner, setShowScanner] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [showCustomFoodForm, setShowCustomFoodForm] = useState(false);
  const [mealType, setMealType] = useState('');

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    
    // Search the food database
    const results = await searchFoods(searchQuery);
    setSearchResults(results);
    
    setTimeout(() => {
      setIsSearching(false);
    }, 500);
  };

  const handleBarcodeScan = (data: string) => {
    console.log('Barcode scanned:', data);
    setShowScanner(false);
    // For demo, show first food item
    const firstFood = searchFoods('')[0];
    if (firstFood) {
      setSelectedFood(firstFood);
    }
  };

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
  };

  const handleAddFood = (foodData: any) => {
    console.log('Adding food:', foodData);
    
    if (!foodData.mealType) {
      if (Platform.OS === 'web') {
        window.alert('Please select a meal type');
      } else {
        Alert.alert('Error', 'Please select a meal type');
      }
      return;
    }
    
    // Add food to diary
    router.push({
      pathname: '/(tabs)/diary',
      params: {
        addFood: JSON.stringify(foodData),
        mealType: foodData.mealType
      }
    });
    
    setSelectedFood(null);
  };

  const handleSaveCustomFood = (foodData: any) => {
    console.log('Saving custom food:', foodData);
    if (!mealType) {
      if (Platform.OS === 'web') {
        window.alert('Please select a meal type');
      } else {
        Alert.alert('Error', 'Please select a meal type');
      }
      return;
    }
    
    // Add custom food to diary
    router.push({
      pathname: '/(tabs)/diary',
      params: {
        addFood: JSON.stringify(foodData),
        mealType
      }
    });
    
    setShowCustomFoodForm(false);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.brand.gradient.start, Colors.brand.gradient.end]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Track Your Progress</Text>
            <Text style={styles.headerTitle}>Log Activity</Text>
          </View>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80' }} 
            style={styles.logo}
          />
        </View>
      </LinearGradient>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'meal' && styles.activeTab]}
          onPress={() => setActiveTab('meal')}
        >
          <Text style={[styles.tabText, activeTab === 'meal' && styles.activeTabText]}>
            Meal
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'workout' && styles.activeTab]}
          onPress={() => setActiveTab('workout')}
        >
          <Text style={[styles.tabText, activeTab === 'workout' && styles.activeTabText]}>
            Workout
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'water' && styles.activeTab]}
          onPress={() => setActiveTab('water')}
        >
          <Text style={[styles.tabText, activeTab === 'water' && styles.activeTabText]}>
            Water
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'meal' && (
        <View style={styles.content}>
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search for food..."
                placeholderTextColor={Colors.text.tertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
              />
              <TouchableOpacity 
                style={styles.searchButton}
                onPress={handleSearch}
              >
                <Search size={20} color={Colors.text.secondary} />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.barcodeButton}
              onPress={() => setShowScanner(true)}
            >
              <Barcode size={20} color={Colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {isSearching ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.brand.primary} />
              <Text style={styles.loadingText}>Searching...</Text>
            </View>
          ) : (
            <ScrollView style={styles.searchResults}>
              {searchResults.length > 0 ? (
                searchResults.map((food) => (
                  <TouchableOpacity
                    key={food.id}
                    style={styles.foodItem}
                    onPress={() => handleSelectFood(food)}
                  >
                    <View style={styles.foodInfo}>
                      <Text style={styles.foodName}>{food.name}</Text>
                      {food.brandName && (
                        <Text style={styles.foodBrand}>{food.brandName}</Text>
                      )}
                      <Text style={styles.foodServing}>{food.servingSize}</Text>
                    </View>
                    <Text style={styles.foodCalories}>{food.calories} cal</Text>
                  </TouchableOpacity>
                ))
              ) : searchQuery ? (
                <View style={styles.noResults}>
                  <Text style={styles.noResultsText}>No foods found</Text>
                </View>
              ) : (
                <View style={styles.searchSuggestions}>
                  <Text style={styles.foodSuggestionText}>
                    Search for food items or scan a barcode to log your meals
                  </Text>
                  <TouchableOpacity
                    style={styles.addCustomButton}
                    onPress={() => setShowCustomFoodForm(true)}
                  >
                    <Plus size={20} color={Colors.brand.primary} />
                    <Text style={styles.addCustomButtonText}>Add Custom Food</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          )}
          
          {selectedFood && (
            <ProductInfo
              productData={{
                name: selectedFood.name,
                calories: selectedFood.calories.toString(),
                protein: selectedFood.protein.toString(),
                carbs: selectedFood.carbs.toString(),
                fat: selectedFood.fat.toString(),
                fiber: selectedFood.fiber?.toString(),
                sugar: selectedFood.sugar?.toString(),
                sodium: selectedFood.sodium?.toString(),
                brandName: selectedFood.brandName,
                servingSize: selectedFood.servingSize,
                imageUrl: selectedFood.imageUrl
              }}
              onClose={() => setSelectedFood(null)}
              onAdd={handleAddFood}
            />
          )}
          
          {showCustomFoodForm && (
            <CustomFoodForm
              onClose={() => setShowCustomFoodForm(false)}
              onSave={handleSaveCustomFood}
            />
          )}
        </View>
      )}

      {activeTab === 'workout' && (
        <ScrollView style={styles.content}>
          <WorkoutLogForm />
        </ScrollView>
      )}

      {activeTab === 'water' && (
        <View style={styles.content}>
          <View style={styles.waterAmountContainer}>
            <Text style={styles.waterAmountValue}>0</Text>
            <Text style={styles.waterAmountLabel}>glasses</Text>
          </View>
          
          <View style={styles.waterControls}>
            <TouchableOpacity style={styles.waterControlButton}>
              <Text style={styles.waterControlButtonText}>-</Text>
            </TouchableOpacity>
            
            <View style={styles.waterGlassesContainer}>
              {Array.from({ length: 8 }).map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.waterGlass,
                    index < 0 ? styles.waterGlassFilled : styles.waterGlassEmpty
                  ]}
                />
              ))}
            </View>
            
            <TouchableOpacity style={styles.waterControlButton}>
              <Text style={styles.waterControlButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.logButton}>
            <LinearGradient
              colors={[Colors.brand.gradient.start, Colors.brand.gradient.end]}
              style={styles.gradientButton}
            >
              <Text style={styles.logButtonText}>Log Water</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {showScanner && (
        <BarcodeScanner
          onScan={handleBarcodeScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: {
    fontSize: 14,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    marginHorizontal: 4,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: Colors.brand.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  activeTabText: {
    color: Colors.text.primary,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.background.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colors.text.primary,
  },
  searchButton: {
    padding: 10,
  },
  barcodeButton: {
    width: 44,
    height: 44,
    backgroundColor: Colors.background.card,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: Colors.text.secondary,
  },
  searchResults: {
    flex: 1,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  foodBrand: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  foodServing: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  foodCalories: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.brand.primary,
    marginLeft: 16,
  },
  noResults: {
    alignItems: 'center',
    padding: 20,
  },
  noResultsText: {
    color: Colors.text.secondary,
    fontSize: 16,
  },
  searchSuggestions: {
    alignItems: 'center',
    padding: 20,
  },
  foodSuggestionText: {
    marginTop: 8,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  addCustomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.card,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  addCustomButtonText: {
    color: Colors.brand.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  waterAmountContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  waterAmountValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.brand.primary,
  },
  waterAmountLabel: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  waterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  waterControlButton: {
    width: 44,
    height: 44,
    backgroundColor: Colors.background.card,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  waterControlButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  waterGlassesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flex: 1,
  },
  waterGlass: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  waterGlassFilled: {
    backgroundColor: Colors.brand.primary,
  },
  waterGlassEmpty: {
    backgroundColor: Colors.background.tertiary,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  logButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  gradientButton: {
    padding: 16,
    alignItems: 'center',
  },
  logButtonText: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});