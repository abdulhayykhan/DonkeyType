import { Keyboard, BarChart2, Info, Volume2, VolumeX, Flame, Trophy } from 'lucide-react';
import { SoundProfile } from '../types';

interface HeaderProps {
  activeTab: 'test' | 'history' | 'about' | 'leaderboard';
  onTabChange: (tab: 'test' | 'history' | 'about' | 'leaderboard') => void;
  soundProfile: SoundProfile;
  onToggleSound: () => void;
  streak: number;
}

export default function Header({ 
  activeTab, 
  onTabChange, 
  soundProfile, 
  onToggleSound,
  streak 
}: HeaderProps) {
  return (
    <header id="app-header" className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 mb-8 border-b border-sub-theme/10">
      {/* Brand & Logo */}
      <div 
        id="brand-container"
        className="flex items-center gap-3 cursor-pointer select-none group"
        onClick={() => onTabChange('test')}
      >
        {/* Sleek Custom Donkey SVG Mascot */}
        <div className="relative w-10 h-10 flex items-center justify-center bg-main-theme/10 rounded-xl group-hover:bg-main-theme/20 transition-all duration-300">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 100 100" 
            className="w-7 h-7 text-main-theme transition-transform duration-300 group-hover:scale-110"
            fill="currentColor"
          >
            {/* Long Donkey Ears */}
            <path d="M28,15 C24,2 18,5 18,15 C18,25 30,45 35,50 C33,40 32,25 28,15 Z" />
            <path d="M72,15 C76,2 82,5 82,15 C82,25 70,45 65,50 C67,40 68,25 72,15 Z" />
            {/* Soft inner ears */}
            <path d="M26,17 C23,8 20,10 20,16 C20,22 28,38 31,42 C30,35 29,24 26,17 Z" fill="rgba(0,0,0,0.15)" />
            <path d="M74,17 C77,8 80,10 80,16 C80,22 72,38 69,42 C70,35 71,24 74,17 Z" fill="rgba(0,0,0,0.15)" />
            {/* Donkey Head */}
            <path d="M35,46 L65,46 L62,80 L38,80 Z" />
            {/* Snout */}
            <path d="M38,70 L62,70 L61,81 C61,84 58,86 50,86 C42,86 39,84 39,81 Z" fill="rgba(0,0,0,0.2)" />
            {/* Nostrils */}
            <circle cx="44" cy="78" r="2.5" fill="rgba(255,255,255,0.4)" />
            <circle cx="56" cy="78" r="2.5" fill="rgba(255,255,255,0.4)" />
            {/* Eyes */}
            <circle cx="42" cy="56" r="3" fill="rgba(0,0,0,0.8)" />
            <circle cx="58" cy="56" r="3" fill="rgba(0,0,0,0.8)" />
            {/* Cheek/Mouth Line details */}
            <path d="M47,63 Q50,65 53,63" stroke="rgba(0,0,0,0.6)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </svg>
          
          {/* Flame streak badge */}
          {streak > 0 && (
            <div className="absolute -top-1 -right-1.5 flex items-center gap-0.5 bg-orange-500 text-white text-[9px] px-1 rounded-full font-sans font-bold shadow-sm animate-pulse">
              <Flame className="w-2.5 h-2.5 fill-current" />
              <span>{streak}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <h1 className="font-sans text-xl font-bold tracking-tight text-main-theme flex items-center gap-1.5">
            donkeytype
          </h1>
          <span className="font-mono text-[10px] text-sub-theme/70 tracking-wider">
            patience & accuracy wins the race
          </span>
        </div>
      </div>

      {/* Navigation & Controls */}
      <div className="flex items-center gap-1 sm:gap-4 select-none">
        <nav className="flex items-center gap-1 bg-sub-theme/5 p-1 rounded-xl">
          <button
            id="nav-test-btn"
            onClick={() => onTabChange('test')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-sans font-medium transition-all duration-200 cursor-pointer ${
              activeTab === 'test'
                ? 'bg-main-theme/15 text-main-theme shadow-xs'
                : 'text-sub-theme hover:text-main-theme'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            <span className="hidden xs:inline">typing test</span>
          </button>

          <button
            id="nav-history-btn"
            onClick={() => onTabChange('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-sans font-medium transition-all duration-200 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-main-theme/15 text-main-theme shadow-xs'
                : 'text-sub-theme hover:text-main-theme'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span className="hidden xs:inline">history & stats</span>
          </button>

          <button
            id="nav-leaderboard-btn"
            onClick={() => onTabChange('leaderboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-sans font-medium transition-all duration-200 cursor-pointer ${
              activeTab === 'leaderboard'
                ? 'bg-main-theme/15 text-main-theme shadow-xs'
                : 'text-sub-theme hover:text-main-theme'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span className="hidden xs:inline">leaderboard</span>
          </button>

          <button
            id="nav-about-btn"
            onClick={() => onTabChange('about')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-sans font-medium transition-all duration-200 cursor-pointer ${
              activeTab === 'about'
                ? 'bg-main-theme/15 text-main-theme shadow-xs'
                : 'text-sub-theme hover:text-main-theme'
            }`}
          >
            <Info className="w-4 h-4" />
            <span className="hidden xs:inline">about</span>
          </button>
        </nav>

        {/* Quick sound switch toggler */}
        <button
          id="sound-toggle-btn"
          onClick={onToggleSound}
          className={`p-2 rounded-xl transition-all duration-200 cursor-pointer ${
            soundProfile !== 'none'
              ? 'bg-main-theme/10 text-main-theme hover:bg-main-theme/20'
              : 'bg-sub-theme/5 text-sub-theme hover:text-main-theme'
          }`}
          title={
            soundProfile !== 'none' 
              ? `Key sound: ${soundProfile} (Click to mute)` 
              : "Key sound: muted (Click to unmute)"
          }
        >
          {soundProfile !== 'none' ? (
            <Volume2 className="w-4 h-4" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </button>
      </div>
    </header>
  );
}
