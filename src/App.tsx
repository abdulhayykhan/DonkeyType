import { useState, useEffect } from 'react';
import { THEMES } from './data';
import { Theme, HistoryItem, ChartDatapoint, SoundProfile } from './types';
import Header from './components/Header';
import TypingPanel from './components/TypingPanel';
import ResultPanel from './components/ResultPanel';
import HistoryPanel from './components/HistoryPanel';
import AboutPanel from './components/AboutPanel';
import LeaderboardPanel from './components/LeaderboardPanel';
import ThemeSelector from './components/ThemeSelector';
import { Keyboard, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  // Navigation states
  const [activeTab, setActiveTab] = useState<'test' | 'history' | 'about' | 'leaderboard'>('test');
  
  // Theme & Sounds
  const [currentTheme, setCurrentTheme] = useState<Theme>(THEMES[0]);
  const [soundProfile, setSoundProfile] = useState<SoundProfile>('mechanical');
  
  // Saved logs
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentResult, setCurrentResult] = useState<{
    item: HistoryItem;
    chart: ChartDatapoint[];
    isPB: boolean;
  } | null>(null);

  // Daily Streak
  const [streak, setStreak] = useState<number>(0);

  // Focus Mode active tracking
  const [isFocusActive, setIsFocusActive] = useState<boolean>(false);

  // Load configuration and data from localStorage on Mount
  useEffect(() => {
    // 1. Theme
    const savedThemeId = localStorage.getItem('donkeytype_theme_id');
    if (savedThemeId) {
      const match = THEMES.find((t) => t.id === savedThemeId);
      if (match) setCurrentTheme(match);
    }

    // 2. Sound profile
    const savedSound = localStorage.getItem('donkeytype_sound_profile');
    if (savedSound) {
      setSoundProfile(savedSound as SoundProfile);
    }

    // 3. Typing History
    const savedHistory = localStorage.getItem('donkeytype_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Error loading history', e);
      }
    }

    // 4. Daily Streak calculation
    calculateStreak();
  }, []);

  // Set CSS variables dynamically on Document Root when Theme changes
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--bg-theme', currentTheme.bg);
    root.style.setProperty('--main-theme', currentTheme.main);
    root.style.setProperty('--sub-theme', currentTheme.sub);
    root.style.setProperty('--caret-theme', currentTheme.caret);
    root.style.setProperty('--error-theme', currentTheme.error);
    root.style.setProperty('--text-theme', currentTheme.text);
    
    // Also save choice
    localStorage.setItem('donkeytype_theme_id', currentTheme.id);
  }, [currentTheme]);

  // Update sound configuration
  const handleSoundChange = (profile: SoundProfile) => {
    setSoundProfile(profile);
    localStorage.setItem('donkeytype_sound_profile', profile);
  };

  const handleToggleSound = () => {
    const profiles: SoundProfile[] = ['none', 'mechanical', 'click', 'typewriter'];
    const currentIndex = profiles.indexOf(soundProfile);
    const nextIndex = (currentIndex + 1) % profiles.length;
    handleSoundChange(profiles[nextIndex]);
  };

  // Streak logic
  const calculateStreak = () => {
    const savedStreak = localStorage.getItem('donkeytype_streak');
    const lastActiveStr = localStorage.getItem('donkeytype_last_active_date');
    
    if (!savedStreak || !lastActiveStr) {
      setStreak(0);
      return;
    }

    const currentStreakVal = parseInt(savedStreak, 10);
    const lastActiveDate = new Date(lastActiveStr);
    const today = new Date();

    // Reset clock details to compare only dates
    lastActiveDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(today.getTime() - lastActiveDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Already active today
      setStreak(currentStreakVal);
    } else if (diffDays === 1) {
      // Active yesterday, maintain streak!
      setStreak(currentStreakVal);
    } else {
      // Streak broken
      setStreak(0);
      localStorage.setItem('donkeytype_streak', '0');
    }
  };

  const incrementStreak = () => {
    const todayStr = new Date().toDateString();
    const lastActiveStr = localStorage.getItem('donkeytype_last_active_date');
    const savedStreak = localStorage.getItem('donkeytype_streak') || '0';

    const currentStreakVal = parseInt(savedStreak, 10);

    if (lastActiveStr === todayStr) {
      // Already logged today, streak stands
      return;
    }

    let newStreak = 1;
    if (lastActiveStr) {
      const lastActiveDate = new Date(lastActiveStr);
      const today = new Date();
      lastActiveDate.setHours(0,0,0,0);
      today.setHours(0,0,0,0);
      const diffTime = Math.abs(today.getTime() - lastActiveDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newStreak = currentStreakVal + 1;
      }
    }

    setStreak(newStreak);
    localStorage.setItem('donkeytype_streak', newStreak.toString());
    localStorage.setItem('donkeytype_last_active_date', todayStr);
  };

  // Handle a finished typing test
  const handleTestComplete = (item: HistoryItem, chartData: ChartDatapoint[]) => {
    // Check if WPM is a personal best for this specific configuration
    const matchingConfigs = history.filter(
      (h) => h.mode === item.mode && h.difficulty === item.difficulty
    );
    
    const isPB = matchingConfigs.length === 0 || item.wpm > Math.max(...matchingConfigs.map((h) => h.wpm));

    // Save item to history
    const updatedHistory = [item, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('donkeytype_history', JSON.stringify(updatedHistory));

    // Log daily training streak
    incrementStreak();

    // Cache results for display
    setCurrentResult({
      item,
      chart: chartData,
      isPB
    });
  };

  const handleRestartTest = () => {
    setCurrentResult(null);
    setActiveTab('test');
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('donkeytype_history');
    setStreak(0);
    localStorage.removeItem('donkeytype_streak');
    localStorage.removeItem('donkeytype_last_active_date');
  };

  return (
    <div 
      id="app-root-container"
      style={{ backgroundColor: currentTheme.bg, color: currentTheme.text }}
      className="min-h-screen transition-colors duration-300 flex flex-col font-sans"
    >
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 md:px-8 flex flex-col py-2">
        
        {/* Navigation & Brand Header */}
        <div className={`transition-all duration-500 ease-in-out transform-gpu origin-top ${isFocusActive ? 'opacity-0 pointer-events-none -translate-y-10 max-h-0 overflow-hidden mb-0 border-b-0' : 'opacity-100 translate-y-0 max-h-[200px]'}`}>
          <Header 
            activeTab={activeTab} 
            onTabChange={(tab) => {
              setActiveTab(tab);
              // Clear current active test results when changing tabs to prevent getting stuck
              if (tab !== 'test') {
                setCurrentResult(null);
              }
            }}
            soundProfile={soundProfile}
            onToggleSound={handleToggleSound}
            streak={streak}
          />
        </div>

        {/* Core Main Panel */}
        <main id="main-content" className="flex-grow flex flex-col justify-center py-4">
          <AnimatePresence mode="wait">
            {activeTab === 'test' && (
              <motion.div
                key="test"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="w-full flex flex-col justify-center"
              >
                {currentResult ? (
                  <ResultPanel
                    historyItem={currentResult.item}
                    chartData={currentResult.chart}
                    onRestart={handleRestartTest}
                    isPersonalBest={currentResult.isPB}
                  />
                ) : (
                  <TypingPanel
                    currentTheme={currentTheme}
                    soundProfile={soundProfile}
                    onTestComplete={handleTestComplete}
                    onSoundChange={handleSoundChange}
                    onFocusActiveChange={setIsFocusActive}
                  />
                )}
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="w-full"
              >
                <HistoryPanel
                  history={history}
                  onClearHistory={handleClearHistory}
                  onStartTest={handleRestartTest}
                />
              </motion.div>
            )}

            {activeTab === 'about' && (
              <motion.div
                key="about"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="w-full"
              >
                <AboutPanel />
              </motion.div>
            )}

            {activeTab === 'leaderboard' && (
              <motion.div
                key="leaderboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="w-full"
              >
                <LeaderboardPanel />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Global Footer Theme Selector */}
        <footer 
          id="app-footer" 
          className={`mt-auto py-8 text-center flex flex-col gap-4 transition-all duration-500 ease-in-out transform-gpu origin-bottom ${
            isFocusActive 
              ? 'opacity-0 pointer-events-none translate-y-10 max-h-0 overflow-hidden py-0 mt-0' 
              : 'opacity-100 translate-y-0 max-h-[300px]'
          }`}
        >
          
          {/* Quick theme grid selector in footer */}
          <ThemeSelector 
            currentTheme={currentTheme} 
            onThemeChange={setCurrentTheme} 
          />

          {/* Copyright details */}
          <div className="flex items-center justify-center gap-1.5 font-mono text-[10px] text-sub-theme/60 uppercase tracking-widest mt-2 select-none">
            <Keyboard className="w-3.5 h-3.5 text-sub-theme/40" />
            <span>DonkeyType © 2026 • built for ultimate keyboard pacing</span>
          </div>

          <div className="footer-row credit-row text-xs text-sub-theme/70 mt-1">
            Made with ❤️ by{' '}
            <a 
              className="credit-link hover-target text-main-theme hover:underline font-semibold transition-colors duration-200" 
              href="https://www.linkedin.com/in/abdulhayykhan/" 
              target="_blank" 
              rel="noreferrer"
            >
              Abdul Hayy Khan
            </a>
          </div>

        </footer>

      </div>
    </div>
  );
}
