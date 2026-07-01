import { THEMES } from '../data';
import { Theme } from '../types';
import { Palette, Check } from 'lucide-react';

interface ThemeSelectorProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export default function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
  return (
    <div 
      id="theme-selector-container"
      className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs opacity-75 hover:opacity-100 transition-opacity duration-200 mt-12 py-4 border-t border-dashed border-sub-theme/20"
    >
      <div className="flex items-center gap-1.5 font-sans font-medium text-sub-theme">
        <Palette className="w-3.5 h-3.5 text-main-theme" />
        <span>active theme:</span>
        <span className="text-main-theme font-semibold font-mono">{currentTheme.name}</span>
      </div>

      <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
        {THEMES.map((t) => {
          const isActive = t.id === currentTheme.id;
          return (
            <button
              key={t.id}
              id={`theme-btn-${t.id}`}
              onClick={() => onThemeChange(t)}
              className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all duration-200 border cursor-pointer font-sans text-[11px] ${
                isActive
                  ? 'bg-main-theme/10 border-main-theme/40 text-main-theme font-medium'
                  : 'bg-transparent border-transparent hover:border-sub-theme/20 text-sub-theme hover:text-main-theme'
              }`}
              title={`Switch to ${t.name}`}
            >
              {/* Color dots preview */}
              <span className="flex items-center gap-0.5">
                <span 
                  className="w-1.5 h-1.5 rounded-full block border border-black/10" 
                  style={{ backgroundColor: t.bg }} 
                />
                <span 
                  className="w-1.5 h-1.5 rounded-full block border border-black/10" 
                  style={{ backgroundColor: t.main }} 
                />
              </span>
              
              <span>{t.name.toLowerCase()}</span>

              {isActive && (
                <Check className="w-2.5 h-2.5 ml-0.5 text-main-theme" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
