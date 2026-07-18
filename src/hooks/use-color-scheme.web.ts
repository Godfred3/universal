import { useEffect, useState, useContext } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { ThemeContext } from '@/context/theme-context';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const context = useContext(ThemeContext);
  const colorScheme = useRNColorScheme();

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  if (!hasHydrated) {
    return 'light';
  }

  if (context) {
    return context.colorScheme;
  }

  return colorScheme;
}
