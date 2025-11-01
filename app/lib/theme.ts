// Inline theme configuration to remove dependency on theme.json
// Colors inspired by SWAD KERALA logo: Deep Navy Blue, Metallic Gold/Bronze, Cream
const theme = {
  colors: {
    // Primary: Deep Navy Blue / Dark Teal from logo
    primary: '#1E3A5F',
    primaryDark: '#0F172A',
    primaryLight: '#2D4A6B',
    
    // Accent: Metallic Gold / Bronze from logo
    accent: '#CD7F32', // Bronze
    accentGold: '#D4AF37', // Gold
    accentLight: '#E8C28A',
    
    // Background: Cream tones for light backgrounds
    background: '#FFFEF0', // Very light cream
    backgroundCream: '#FAF3E0',
    backgroundLight: '#FFFEF8',
    
    // Text colors
    text: '#1E3A5F', // Navy blue for primary text
    textLight: '#FFFEF0', // Cream for text on dark backgrounds
    textDark: '#0F172A',
  },
} as const;

export type ThemeColors = typeof theme.colors;
export type ThemeConfig = typeof theme;

/**
 * Get a color from the theme
 * @param colorName - Name of the color (e.g., "primary", "background", "text")
 * @returns The color value or undefined if not found
 */
export function getThemeColor(colorName: string): string | undefined {
  const color = theme.colors[colorName as keyof ThemeColors];
  return typeof color === 'string' ? color : undefined;
}

/**
 * Get the complete theme configuration
 */
export function getTheme(): ThemeConfig {
  return theme;
}

/**
 * Get all available color names
 */
export function getColorNames(): string[] {
  return Object.keys(theme.colors);
}

/**
 * Check if a color exists in the theme
 * @param colorName - Name of the color to check
 */
export function hasThemeColor(colorName: string): boolean {
  return getThemeColor(colorName) !== undefined;
}

/**
 * Get CSS variable for a theme color
 * @param colorName - Name of the color
 * @returns CSS variable string like "var(--color-primary)"
 */
export function getThemeColorVar(colorName: string): string {
  const color = getThemeColor(colorName);
  if (!color) return '';

  const cssVar = `--color-${colorName}`;
  return `var(${cssVar})`;
}