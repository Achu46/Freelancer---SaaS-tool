import { useTheme } from '../contexts/ThemeContext';

export function useDarkMode() {
  const { isDark, toggleDark, setIsDark } = useTheme();
  return { isDark, toggleDark, setIsDark };
}

