
import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    setIsMenuOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="w-full flex items-center justify-center p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label="Toggle theme"
        aria-haspopup="true"
        aria-expanded={isMenuOpen}
      >
        <SunIcon className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <MoonIcon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </button>

      {isMenuOpen && (
        <div className="absolute bottom-full mb-2 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1">
            <button
              onClick={() => handleThemeChange('light')}
              className={`block w-full text-left px-4 py-2 text-sm ${
                theme === 'light' ? 'bg-gray-100 dark:bg-gray-700' : ''
              } text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700`}
            >
              Light
            </button>
            <button
              onClick={() => handleThemeChange('dark')}
              className={`block w-full text-left px-4 py-2 text-sm ${
                theme === 'dark' ? 'bg-gray-100 dark:bg-gray-700' : ''
              } text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700`}
            >
              Dark
            </button>
            <button
              onClick={() => handleThemeChange('system')}
              className={`block w-full text-left px-4 py-2 text-sm ${
                theme === 'system' ? 'bg-gray-100 dark:bg-gray-700' : ''
              } text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700`}
            >
              System
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;