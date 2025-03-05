import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Platform, Alert } from 'react-native';
import { X } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useState } from 'react';

interface ProductInfoProps {
  productData: {
    name: string;
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
    fiber?: string;
    sugar?: string;
    sodium?: string;
    brandName?: string;
    ingredients?: string;
    imageUrl?: string;
    servingSize?: string;
  };
  onClose: () => void;
  onAdd: (productData: any) => void;
}

export default function ProductInfo({ productData, onClose, onAdd }: ProductInfoProps) {
  const [selectedMealType, setSelectedMealType] = useState('');
  
  const handleAdd = () => {
    if (!selectedMealType) {
      if (Platform.OS === 'web') {
        window.alert('Please select a meal type');
      } else {
        Alert.alert('Error', 'Please select a meal type');
      }
      return;
    }
    onAdd({ ...productData, mealType: selectedMealType });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Product Information</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={24} color={Colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.content}>
        {productData.imageUrl && (
          <Image 
            source={{ uri: productData.imageUrl }} 
            style={styles.productImage}
            resizeMode="contain"
          />
        )}

        <Text style={styles.productName}>{productData.name}</Text>
        
        {productData.brandName && (
          <Text style={styles.brandName}>{productData.brandName}</Text>
        )}

        {productData.servingSize && (
          <Text style={styles.servingSize}>Serving size: {productData.servingSize}</Text>
        )}

        <View style={styles.nutritionContainer}>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{productData.calories}</Text>
            <Text style={styles.nutritionLabel}>Calories</Text>
          </View>
          
          <View style={styles.nutritionDivider} />
          
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{productData.protein}g</Text>
            <Text style={styles.nutritionLabel}>Protein</Text>
          </View>
          
          <View style={styles.nutritionDivider} />
          
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{productData.carbs}g</Text>
            <Text style={styles.nutritionLabel}>Carbs</Text>
          </View>
          
          <View style={styles.nutritionDivider} />
          
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{productData.fat}g</Text>
            <Text style={styles.nutritionLabel}>Fat</Text>
          </View>
        </View>

        {(productData.fiber || productData.sugar || productData.sodium) && (
          <View style={styles.additionalNutrients}>
            {productData.fiber && (
              <View style={styles.nutrientRow}>
                <Text style={styles.nutrientName}>Fiber</Text>
                <Text style={styles.nutrientValue}>{productData.fiber}g</Text>
              </View>
            )}
            
            {productData.sugar && (
              <View style={styles.nutrientRow}>
                <Text style={styles.nutrientName}>Sugar</Text>
                <Text style={styles.nutrientValue}>{productData.sugar}g</Text>
              </View>
            )}
            
            {productData.sodium && (
              <View style={styles.nutrientRow}>
                <Text style={styles.nutrientName}>Sodium</Text>
                <Text style={styles.nutrientValue}>{productData.sodium}mg</Text>
              </View>
            )}
          </View>
        )}

        {productData.ingredients && (
          <View style={styles.ingredientsContainer}>
            <Text style={styles.ingredientsTitle}>Ingredients</Text>
            <Text style={styles.ingredientsText}>{productData.ingredients}</Text>
          </View>
        )}

        <View style={styles.mealTypeContainer}>
          <Text style={styles.mealTypeTitle}>Select Meal Type</Text>
          <View style={styles.mealTypeButtons}>
            {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.mealTypeButton,
                  selectedMealType === type && styles.mealTypeButtonActive
                ]}
                onPress={() => setSelectedMealType(type)}
              >
                <Text 
                  style={[
                    styles.mealTypeButtonText,
                    selectedMealType === type && styles.mealTypeButtonTextActive
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAdd}
        >
          <Text style={styles.addButtonText}>Add to Food Log</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.divider,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    maxHeight: '100%',
  },
  content: {
    padding: 16,
    alignItems: 'center',
  },
  productImage: {
    width: 150,
    height: 150,
    marginBottom: 16,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  brandName: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  servingSize: {
    fontSize: 14,
    color: Colors.text.tertiary,
    textAlign: 'center',
    marginBottom: 16,
  },
  nutritionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: Colors.background.tertiary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  nutritionItem: {
    alignItems: 'center',
    flex: 1,
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  nutritionLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  nutritionDivider: {
    width: 1,
    backgroundColor: Colors.ui.divider,
    marginHorizontal: 8,
  },
  additionalNutrients: {
    width: '100%',
    backgroundColor: Colors.background.tertiary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  nutrientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  nutrientName: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  nutrientValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  ingredientsContainer: {
    width: '100%',
    backgroundColor: Colors.background.tertiary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  ingredientsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  ingredientsText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  mealTypeContainer: {
    width: '100%',
    marginBottom: 24,
  },
  mealTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  mealTypeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  mealTypeButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.background.tertiary,
    borderRadius: 8,
    padding: 12,
    margin: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  mealTypeButtonActive: {
    backgroundColor: Colors.brand.primary,
    borderColor: Colors.brand.primary,
  },
  mealTypeButtonText: {
    color: Colors.text.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
  mealTypeButtonTextActive: {
    color: Colors.text.primary,
  },
  addButton: {
    backgroundColor: Colors.brand.primary,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
  },
  addButtonText: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});