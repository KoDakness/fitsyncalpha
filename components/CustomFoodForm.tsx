import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { X } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { foodCategories } from '@/lib/foodDatabase';

interface CustomFoodFormProps {
  onClose: () => void;
  onSave: (foodData: any) => void;
}

export default function CustomFoodForm({ onClose, onSave }: CustomFoodFormProps) {
  const [name, setName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [servingSize, setServingSize] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [fiber, setFiber] = useState('');
  const [sugar, setSugar] = useState('');
  const [sodium, setSodium] = useState('');
  const [category, setCategory] = useState(foodCategories[0]);

  const handleSave = () => {
    if (!name || !servingSize || !calories) {
      return; // Add validation feedback
    }

    const foodData = {
      name,
      brandName: brandName || undefined,
      servingSize,
      calories: parseInt(calories),
      protein: parseFloat(protein) || 0,
      carbs: parseFloat(carbs) || 0,
      fat: parseFloat(fat) || 0,
      fiber: fiber ? parseFloat(fiber) : undefined,
      sugar: sugar ? parseFloat(sugar) : undefined,
      sodium: sodium ? parseFloat(sodium) : undefined,
      category
    };

    onSave(foodData);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Add Custom Food</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={24} color={Colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Food Name*</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g., Homemade Granola"
            placeholderTextColor={Colors.text.tertiary}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Brand Name (optional)</Text>
          <TextInput
            style={styles.input}
            value={brandName}
            onChangeText={setBrandName}
            placeholder="e.g., Homemade"
            placeholderTextColor={Colors.text.tertiary}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Serving Size*</Text>
          <TextInput
            style={styles.input}
            value={servingSize}
            onChangeText={setServingSize}
            placeholder="e.g., 1 cup (100g)"
            placeholderTextColor={Colors.text.tertiary}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Calories*</Text>
          <TextInput
            style={styles.input}
            value={calories}
            onChangeText={setCalories}
            keyboardType="numeric"
            placeholder="e.g., 250"
            placeholderTextColor={Colors.text.tertiary}
          />
        </View>

        <View style={styles.macroRow}>
          <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Protein (g)</Text>
            <TextInput
              style={styles.input}
              value={protein}
              onChangeText={setProtein}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={Colors.text.tertiary}
            />
          </View>

          <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Carbs (g)</Text>
            <TextInput
              style={styles.input}
              value={carbs}
              onChangeText={setCarbs}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={Colors.text.tertiary}
            />
          </View>

          <View style={[styles.inputContainer, { flex: 1 }]}>
            <Text style={styles.label}>Fat (g)</Text>
            <TextInput
              style={styles.input}
              value={fat}
              onChangeText={setFat}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={Colors.text.tertiary}
            />
          </View>
        </View>

        <View style={styles.macroRow}>
          <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Fiber (g)</Text>
            <TextInput
              style={styles.input}
              value={fiber}
              onChangeText={setFiber}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={Colors.text.tertiary}
            />
          </View>

          <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Sugar (g)</Text>
            <TextInput
              style={styles.input}
              value={sugar}
              onChangeText={setSugar}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={Colors.text.tertiary}
            />
          </View>

          <View style={[styles.inputContainer, { flex: 1 }]}>
            <Text style={styles.label}>Sodium (mg)</Text>
            <TextInput
              style={styles.input}
              value={sodium}
              onChangeText={setSodium}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={Colors.text.tertiary}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Category</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryContainer}
          >
            {foodCategories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryButton,
                  category === cat && styles.categoryButtonActive
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    category === cat && styles.categoryButtonTextActive
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Food</Text>
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
    maxHeight: '90%',
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
  form: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.background.tertiary,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text.primary,
  },
  macroRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  categoryButton: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  categoryButtonActive: {
    backgroundColor: Colors.brand.primary,
    borderColor: Colors.brand.primary,
  },
  categoryButtonText: {
    color: Colors.text.secondary,
    fontSize: 14,
  },
  categoryButtonTextActive: {
    color: Colors.text.primary,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: Colors.brand.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});