import { Tabs } from 'expo-router';
import { Chrome as Home, ClipboardList, User, Book, Dumbbell } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Custom tab bar icon with gradient background for active state
function TabBarIcon({ focused, color, size, Icon }: { focused: boolean; color: string; size: number; Icon: any }) {
  if (focused) {
    return (
      <LinearGradient
        colors={[Colors.brand.gradient.start, Colors.brand.gradient.end]}
        style={styles.iconGradient}
      >
        <Icon size={size - 4} color="#FFFFFF" />
      </LinearGradient>
    );
  }
  return <Icon size={size} color={color} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.brand.primary,
        tabBarInactiveTintColor: Colors.text.tertiary,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: Colors.ui.border,
          paddingTop: 8,
          paddingBottom: 12, // Increased from 8 to 12 for better visibility on iPhone
          height: 70, // Increased from 60 to 70 for better visibility on iPhone
          backgroundColor: Colors.background.card,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: 5,
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color, size }) => (
            <TabBarIcon focused={focused} color={color} size={size} Icon={Home} />
          ),
        }}
      />
      <Tabs.Screen
        name="diary"
        options={{
          title: 'Diary',
          tabBarIcon: ({ focused, color, size }) => (
            <TabBarIcon focused={focused} color={color} size={size} Icon={Book} />
          ),
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          title: 'Log',
          tabBarIcon: ({ focused, color, size }) => (
            <TabBarIcon focused={focused} color={color} size={size} Icon={ClipboardList} />
          ),
        }}
      />
      <Tabs.Screen
        name="workout"
        options={{
          title: 'Workout',
          tabBarIcon: ({ focused, color, size }) => (
            <TabBarIcon focused={focused} color={color} size={size} Icon={Dumbbell} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color, size }) => (
            <TabBarIcon focused={focused} color={color} size={size} Icon={User} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  }
});