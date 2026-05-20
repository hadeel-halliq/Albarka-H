import { useState, useEffect } from 'react';

export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage or default to false (light mode)
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });
  
  useEffect(() => {
    // Update localStorage and document class when theme changes
    if (isDark) {
      localStorage.setItem('theme', 'dark');
      document.documentElement.classList.add('dark');
    } else {
      localStorage.setItem('theme', 'light');
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  return { isDark, toggleTheme };
}