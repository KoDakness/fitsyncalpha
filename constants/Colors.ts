// FitSync theme color palette with blue gradient accents
const Colors = {
  // Base colors
  background: {
    primary: '#121212',    // Main background (near black)
    secondary: '#1E293B',  // Secondary background (dark blue-gray)
    tertiary: '#2D3748',   // Tertiary background (medium blue-gray)
    card: '#1A202C',       // Card background
    elevated: '#2D3748',   // Elevated surfaces
  },
  
  // Text colors
  text: {
    primary: '#FFFFFF',    // Primary text (white)
    secondary: '#CBD5E0',  // Secondary text (light gray)
    tertiary: '#718096',   // Tertiary text (medium gray)
    disabled: '#4A5568',   // Disabled text
  },
  
  // Brand colors - Updated for FitSync gradient blue theme
  brand: {
    primary: '#3B82F6',    // Primary blue
    secondary: '#2563EB',  // Darker blue
    accent: '#60A5FA',     // Light blue accent
    light: '#93C5FD',      // Very light blue
    gradient: {
      start: '#4FD1C5',    // Teal start color (from logo)
      end: '#2B6CB0',      // Deep blue end color (from logo)
    }
  },
  
  // Functional colors
  functional: {
    success: '#10B981',    // Success green
    warning: '#F59E0B',    // Warning yellow
    error: '#EF4444',      // Error red
    info: '#3B82F6',       // Info blue
  },
  
  // UI element colors
  ui: {
    divider: '#374151',    // Dividers
    border: '#2D3748',     // Borders
    icon: '#CBD5E0',       // Icons
    highlight: '#2563EB',  // Highlight (dark blue)
  },
  
  // Tab bar specific
  tabBar: {
    active: '#3B82F6',     // Active tab (blue)
    inactive: '#718096',   // Inactive tab (gray)
    background: '#0F172A', // Tab bar background
  }
};

export default Colors;