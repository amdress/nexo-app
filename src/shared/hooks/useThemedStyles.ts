// @/shared/hooks/useThemedStyles.ts
import { useTheme } from "@/shared/context/ThemeContext";

export function useThemedStyles<T>(getStyles: (COLORS: any) => T) {
  const { theme: { colors: COLORS } } = useTheme();
  
  // Retorna un array: el primer elemento son los estilos, el segundo son los colores limpios
  return [getStyles(COLORS), COLORS] as const;
}