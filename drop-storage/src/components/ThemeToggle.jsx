import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: 'light', label: '☀️', title: 'Light' },
    { value: 'dark', label: '🌙', title: 'Dark' },
    { value: 'system', label: '💻', title: 'System' },
  ];

  return (
    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-900 rounded-full p-1 border border-gray-200 dark:border-gray-700">
      {themes.map((t) => (
        <button
          key={t.value}
          onClick={() => setTheme(t.value)}
          className={`p-2 rounded-full transition-all duration-200 text-lg ${
            theme === t.value
              ? 'bg-zest text-white shadow-lg'
              : 'hover:bg-gray-200 dark:hover:bg-gray-800'
          }`}
          title={t.title}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
