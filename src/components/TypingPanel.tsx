import React, { useState, useEffect, useRef } from 'react';
import { 
  TypingMode, TimeOption, WordOption, QuoteLength, WordDifficulty, SoundProfile, ChartDatapoint, HistoryItem, Theme 
} from '../types';
import { NORMAL_WORDS, ENGLISH_1000, CODE_WORDS, QUOTES } from '../data';
import { playKeySound, playErrorSound } from '../utils/audio';
import { RotateCcw, Clock, Type, Quote as QuoteIcon, BookOpen, AlertCircle, Eye, EyeOff, Sparkles, Volume2, VolumeX, Volume1, ShieldAlert } from 'lucide-react';

interface TypingPanelProps {
  currentTheme: Theme;
  soundProfile: SoundProfile;
  onTestComplete: (historyItem: HistoryItem, chartData: ChartDatapoint[]) => void;
  onSoundChange: (profile: SoundProfile) => void;
  onFocusActiveChange?: (isActive: boolean) => void;
}

export default function TypingPanel({ 
  currentTheme, 
  soundProfile, 
  onTestComplete,
  onSoundChange,
  onFocusActiveChange
}: TypingPanelProps) {
  // Test Configuration States
  const [difficulty, setDifficulty] = useState<WordDifficulty>('normal');
  const [mode, setMode] = useState<TypingMode>('time');
  const [timeOption, setTimeOption] = useState<TimeOption>(30);
  const [wordOption, setWordOption] = useState<WordOption>(25);
  const [quoteLength, setQuoteLength] = useState<QuoteLength>('medium');
  const [wpmGoal, setWpmGoal] = useState<number>(() => {
    const saved = localStorage.getItem('donkeytype-wpm-goal');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [soundVolume, setSoundVolume] = useState<number>(() => {
    const saved = localStorage.getItem('donkeytype-sound-volume');
    return saved ? parseInt(saved, 10) : 50;
  });

  // Engine States
  const [wordsList, setWordsList] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [currentTypedValue, setCurrentTypedValue] = useState<string>('');
  const [typedHistory, setTypedHistory] = useState<string[]>([]); // words completed so far
  
  // Status States
  const [isTestRunning, setIsTestRunning] = useState<boolean>(false);
  const [isTestStarted, setIsTestStarted] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isFocused, setIsFocused] = useState<boolean>(true);

  const [focusMode, setFocusMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('donkeytype-focus-mode');
    return saved === 'true';
  });

  useEffect(() => {
    const active = focusMode && isTestStarted;
    onFocusActiveChange?.(active);
    return () => {
      onFocusActiveChange?.(false);
    };
  }, [focusMode, isTestStarted, onFocusActiveChange]);

  // Stats Counters
  const errorsThisSecondRef = useRef<number>(0);
  const [chartDatapoints, setChartDatapoints] = useState<ChartDatapoint[]>([]);
  
  // Characters typed counters for the whole session
  const [sessionCorrectChars, setSessionCorrectChars] = useState<number>(0);
  const [sessionIncorrectChars, setSessionIncorrectChars] = useState<number>(0);
  const [sessionExtraChars, setSessionExtraChars] = useState<number>(0);
  const [sessionMissedChars, setSessionMissedChars] = useState<number>(0);

  // HTML Element Refs
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const wordsContainerRef = useRef<HTMLDivElement>(null);
  const activeWordRef = useRef<HTMLDivElement>(null);

  // Refs to store the latest values for the stable timer interval without triggering effects
  const wordsListRef = useRef<string[]>(wordsList);
  const currentWordIndexRef = useRef<number>(currentWordIndex);
  const currentTypedValueRef = useRef<string>(currentTypedValue);
  const typedHistoryRef = useRef<string[]>(typedHistory);

  useEffect(() => { wordsListRef.current = wordsList; }, [wordsList]);
  useEffect(() => { currentWordIndexRef.current = currentWordIndex; }, [currentWordIndex]);
  useEffect(() => { currentTypedValueRef.current = currentTypedValue; }, [currentTypedValue]);
  useEffect(() => { typedHistoryRef.current = typedHistory; }, [typedHistory]);

  const getCorrectCharacters = () => {
    let correct = 0;
    const history = typedHistoryRef.current;
    const list = wordsListRef.current;
    const activeIndex = currentWordIndexRef.current;
    const typedVal = currentTypedValueRef.current;

    history.forEach((typed, index) => {
      const original = list[index];
      if (!original) return;
      for (let i = 0; i < Math.min(typed.length, original.length); i++) {
        if (typed[i] === original[i]) correct++;
      }
      if (index < activeIndex) {
        correct++; // Space was correct
      }
    });

    const activeWord = list[activeIndex];
    if (activeWord) {
      for (let i = 0; i < Math.min(typedVal.length, activeWord.length); i++) {
        if (typedVal[i] === activeWord[i]) correct++;
      }
    }
    return correct;
  };

  const getTotalTypedCharacters = () => {
    let total = typedHistoryRef.current.reduce((sum, word) => sum + word.length + 1, 0);
    total += currentTypedValueRef.current.length;
    return total;
  };

  // Initialize and Reset the typing test
  useEffect(() => {
    generateNewTest();
  }, [mode, timeOption, wordOption, quoteLength, difficulty]);

  // Keep countdown ticking when started
  useEffect(() => {
    let timer: any = null;
    if (isTestStarted && isTestRunning) {
      timer = setInterval(() => {
        let currentSec = 0;
        setElapsedSeconds((prev) => {
          currentSec = prev + 1;
          return currentSec;
        });

        // Compute current WPM metrics for the chart point safely
        setTimeout(() => {
          const totalTypedCorrect = getCorrectCharacters();
          const currentTotalTyped = getTotalTypedCharacters();
          
          const currentWpm = currentSec > 0 
            ? Math.round((totalTypedCorrect / 5) / (currentSec / 60)) 
            : 0;
          const currentRawWpm = currentSec > 0 
            ? Math.round((currentTotalTyped / 5) / (currentSec / 60)) 
            : 0;

          setChartDatapoints((prevPoints) => [
            ...prevPoints,
            {
              second: currentSec,
              wpm: currentWpm,
              rawWpm: currentRawWpm,
              errors: errorsThisSecondRef.current,
            }
          ]);
          
          // Reset error buffer for the next second
          errorsThisSecondRef.current = 0;
        }, 0);

        if (mode === 'time') {
          setTimeLeft((prev) => Math.max(0, prev - 1));
        }
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isTestStarted, isTestRunning, mode]);

  // End test when time runs out
  useEffect(() => {
    if (mode === 'time' && isTestStarted && isTestRunning && timeLeft === 0) {
      endTest(timeOption);
    }
  }, [timeLeft, mode, isTestStarted, isTestRunning, timeOption]);

  // Auto scroll to center active word
  useEffect(() => {
    if (activeWordRef.current && wordsContainerRef.current) {
      const activeElement = activeWordRef.current;
      const container = wordsContainerRef.current;
      
      const activeTop = activeElement.offsetTop;
      const activeHeight = activeElement.offsetHeight;
      const containerHeight = container.offsetHeight;

      // Scroll smoothly to center the active row
      const targetScroll = activeTop - containerHeight / 2 + activeHeight / 2;
      container.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    }
  }, [currentWordIndex]);

  // Handle global shortcuts (e.g. Tab to restart)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Tab key restarts the test
      if (e.key === 'Tab') {
        e.preventDefault();
        generateNewTest();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [mode, timeOption, wordOption, quoteLength, difficulty]);

  // Generate a random set of words or quote
  const generateNewTest = () => {
    setIsTestRunning(false);
    setIsTestStarted(false);
    setCurrentWordIndex(0);
    setCurrentTypedValue('');
    setTypedHistory([]);
    setElapsedSeconds(0);
    errorsThisSecondRef.current = 0;
    setChartDatapoints([]);
    
    // Reset session characters
    setSessionCorrectChars(0);
    setSessionIncorrectChars(0);
    setSessionExtraChars(0);
    setSessionMissedChars(0);

    if (mode === 'time') {
      setTimeLeft(timeOption);
    } else {
      setTimeLeft(0);
    }

    let sourceList = NORMAL_WORDS;
    if (difficulty === 'english1000') {
      sourceList = ENGLISH_1000;
    } else if (difficulty === 'code') {
      sourceList = CODE_WORDS;
    }

    if (mode === 'quote') {
      // Filter quotes by length
      const filteredQuotes = QUOTES.filter((q) => {
        const wordsCount = q.text.split(' ').length;
        if (quoteLength === 'short') return wordsCount <= 12;
        if (quoteLength === 'medium') return wordsCount > 12 && wordsCount <= 28;
        return wordsCount > 28;
      });

      const selectedQuote = filteredQuotes.length > 0 
        ? filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)]
        : QUOTES[0];

      setWordsList(selectedQuote.text.split(' '));
    } else if (mode === 'zen') {
      // Infinite zen mode, pre-generate 200 words, add more as they type
      const randomized: string[] = [];
      for (let i = 0; i < 200; i++) {
        randomized.push(sourceList[Math.floor(Math.random() * sourceList.length)]);
      }
      setWordsList(randomized);
    } else {
      // 'words' mode or 'time' mode: generate set count of words
      const wordsCountNeeded = mode === 'words' ? wordOption : 150; // generous count for time mode
      const randomized: string[] = [];
      for (let i = 0; i < wordsCountNeeded; i++) {
        randomized.push(sourceList[Math.floor(Math.random() * sourceList.length)]);
      }
      setWordsList(randomized);
    }

    // Direct focus to hidden input
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 50);
  };

  // Live total characters calculations
  const calculateCorrectCharacters = () => {
    let correct = 0;
    // Count from history
    typedHistory.forEach((typed, index) => {
      const original = wordsList[index];
      if (!original) return;
      for (let i = 0; i < Math.min(typed.length, original.length); i++) {
        if (typed[i] === original[i]) correct++;
      }
      // Add space character as correct if typed correct word or matching length
      if (index < currentWordIndex) {
        correct++; // Space was correct
      }
    });

    // Count from current typing
    const activeWord = wordsList[currentWordIndex];
    if (activeWord) {
      for (let i = 0; i < Math.min(currentTypedValue.length, activeWord.length); i++) {
        if (currentTypedValue[i] === activeWord[i]) correct++;
      }
    }
    return correct;
  };

  const calculateTotalTypedCharacters = () => {
    let total = typedHistory.reduce((sum, word) => sum + word.length + 1, 0); // +1 for spaces
    total += currentTypedValue.length;
    return total;
  };

  // Complete the test and transition
  const endTest = (overrideDuration?: number) => {
    setIsTestRunning(false);
    
    const finalSeconds = (overrideDuration && overrideDuration > 0) ? overrideDuration : (elapsedSeconds || 1);
    
    // Core calculation metrics
    let correctChars = 0;
    let incorrectChars = 0;
    let extraChars = 0;
    let missedChars = 0;

    // Traverse all completed words
    wordsList.slice(0, currentWordIndex + 1).forEach((originalWord, index) => {
      const typedWord = index === currentWordIndex ? currentTypedValue : typedHistory[index];
      if (typedWord === undefined) return;

      for (let i = 0; i < Math.max(originalWord.length, typedWord.length); i++) {
        const originalChar = originalWord[i];
        const typedChar = typedWord[i];

        if (typedChar === undefined) {
          // Missed character
          missedChars++;
        } else if (originalChar === undefined) {
          // Extra characters typed
          extraChars++;
        } else if (typedChar === originalChar) {
          // Correct character
          correctChars++;
        } else {
          // Incorrect character
          incorrectChars++;
        }
      }
    });

    // Add spaces as correct keys
    correctChars += currentWordIndex;

    const totalSubmittedKeys = correctChars + incorrectChars + extraChars;
    const finalAccuracy = totalSubmittedKeys > 0 
      ? Math.round((correctChars / totalSubmittedKeys) * 100) 
      : 100;

    // Calculate final speed (WPM = (correct chars / 5) / (seconds / 60))
    const finalWpm = Math.max(0, Math.round((correctChars / 5) / (finalSeconds / 60)));
    const finalRawWpm = Math.max(0, Math.round((totalSubmittedKeys / 5) / (finalSeconds / 60)));

    // Generate Chart timeline data if it was too short/empty
    let compiledChart = [...chartDatapoints];
    if (compiledChart.length === 0) {
      compiledChart = [{
        second: 1,
        wpm: finalWpm,
        rawWpm: finalRawWpm,
        errors: incorrectChars
      }];
    }

    const historyRecord: HistoryItem = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      wpm: finalWpm,
      rawWpm: finalRawWpm,
      accuracy: finalAccuracy,
      mode: mode,
      difficulty: difficulty,
      duration: finalSeconds,
      wordsCount: currentWordIndex + 1,
      charsTyped: {
        correct: correctChars,
        incorrect: incorrectChars,
        extra: extraChars,
        missed: missedChars
      }
    };

    onTestComplete(historyRecord, compiledChart);
  };

  // Keyboard and Input Changes
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    
    // Don't do anything if test isn't running and we typed a space as first key
    if (!isTestStarted && value.trim() === '') {
      setCurrentTypedValue('');
      return;
    }

    // Start test on first valid character press
    if (!isTestStarted) {
      setIsTestStarted(true);
      setIsTestRunning(true);
      setElapsedSeconds(0);
    }

    const lastChar = value[value.length - 1];
    const isSpace = lastChar === ' ';

    // Play click noise
    if (soundProfile !== 'none') {
      // Check if last character typed is correct
      const activeWord = wordsList[currentWordIndex];
      const charIndex = value.length - 1;
      const volumeMultiplier = soundVolume / 100;
      
      if (isSpace) {
        playKeySound(soundProfile, true, volumeMultiplier);
      } else if (activeWord && charIndex < activeWord.length && lastChar === activeWord[charIndex]) {
        playKeySound(soundProfile, false, volumeMultiplier);
      } else {
        // Misspelled, play error synth buzz!
        playErrorSound(volumeMultiplier);
        errorsThisSecondRef.current += 1;
      }
    } else {
      // Even if sound is muted, track errors for timeline chart
      const activeWord = wordsList[currentWordIndex];
      const charIndex = value.length - 1;
      if (!isSpace && activeWord && (charIndex >= activeWord.length || lastChar !== activeWord[charIndex])) {
        errorsThisSecondRef.current += 1;
      }
    }

    // Spacebar completes the word
    if (isSpace) {
      const wordToSubmit = value.slice(0, -1); // remove space
      const newHistory = [...typedHistory, wordToSubmit];
      setTypedHistory(newHistory);
      setCurrentTypedValue('');
      
      const nextIndex = currentWordIndex + 1;
      setCurrentWordIndex(nextIndex);

      // Check if finished test (in Words mode or Quote mode)
      if ((mode === 'words' && nextIndex >= wordOption) || (mode === 'quote' && nextIndex >= wordsList.length)) {
        endTest(elapsedSeconds || 1);
      }

      // If Zen mode, keep appending words to avoid exhaustion
      if (mode === 'zen' && nextIndex >= wordsList.length - 10) {
        const sourceList = difficulty === 'normal' ? NORMAL_WORDS : difficulty === 'english1000' ? ENGLISH_1000 : CODE_WORDS;
        const extra: string[] = [];
        for (let i = 0; i < 100; i++) {
          extra.push(sourceList[Math.floor(Math.random() * sourceList.length)]);
        }
        setWordsList((prev) => [...prev, ...extra]);
      }
      return;
    }

    setCurrentTypedValue(value);

    // End test early if they completed the absolute last character of the last word in words/quote mode (without needing space)
    const activeWord = wordsList[currentWordIndex];
    const isLastWord = (mode === 'words' && currentWordIndex === wordOption - 1) || (mode === 'quote' && currentWordIndex === wordsList.length - 1);
    if (isLastWord && value === activeWord) {
      const newHistory = [...typedHistory, value];
      setTypedHistory(newHistory);
      setCurrentTypedValue('');
      // Schedule end of test
      setTimeout(() => {
        endTest(elapsedSeconds || 1);
      }, 50);
    }
  };

  // Handle backspace to previous words if enabled
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Escape or Tab restarts
    if (e.key === 'Escape') {
      generateNewTest();
    }

    // Backspace on empty input goes back to the previous word
    if (e.key === 'Backspace' && currentTypedValue === '' && currentWordIndex > 0) {
      e.preventDefault();
      const prevWord = typedHistory[typedHistory.length - 1];
      setCurrentTypedValue(prevWord);
      setTypedHistory(typedHistory.slice(0, -1));
      setCurrentWordIndex(currentWordIndex - 1);
    }
  };

  // Refocus handler
  const triggerFocus = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    setIsFocused(true);
  };

  // Live typing WPM metrics for headsup display
  const liveCorrectChars = calculateCorrectCharacters();
  const liveWpm = elapsedSeconds > 0 
    ? Math.round((liveCorrectChars / 5) / (elapsedSeconds / 60)) 
    : 0;

  return (
    <div id="typing-test-panel" className="max-w-4xl mx-auto space-y-6">
      
      {/* Option Config Menubars (Hide once typing starts to reduce distraction) */}
      {!isTestStarted && (
        <div id="test-config-bar" className="bg-sub-theme/5 border border-sub-theme/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 select-none animate-fadeIn">
          {/* Difficulty / Language Picker */}
          <div className="flex items-center gap-1">
            <span className="font-mono text-[10px] text-sub-theme mr-2">difficulty:</span>
            {(['normal', 'english1000', 'code'] as WordDifficulty[]).map((diff) => (
              <button
                key={diff}
                id={`diff-btn-${diff}`}
                onClick={() => setDifficulty(diff)}
                className={`px-3 py-1 rounded-lg text-xs font-sans font-semibold transition-all duration-150 cursor-pointer ${
                  difficulty === diff
                    ? 'bg-main-theme/15 text-main-theme font-bold'
                    : 'text-sub-theme hover:text-main-theme'
                }`}
              >
                {diff === 'normal' ? 'english' : diff === 'english1000' ? 'english 1k' : 'code syntax'}
              </button>
            ))}
          </div>

          {/* Mode Toggles */}
          <div className="flex items-center gap-1 border-l border-sub-theme/10 pl-1 sm:pl-4">
            <span className="font-mono text-[10px] text-sub-theme mr-2 hidden sm:inline">mode:</span>
            {(['time', 'words', 'quote', 'zen'] as TypingMode[]).map((m) => (
              <button
                key={m}
                id={`mode-btn-${m}`}
                onClick={() => setMode(m)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-sans font-semibold transition-all duration-150 cursor-pointer ${
                  mode === m
                    ? 'bg-main-theme/15 text-main-theme font-bold'
                    : 'text-sub-theme hover:text-main-theme'
                }`}
              >
                {m === 'time' ? <Clock className="w-3.5 h-3.5" /> : m === 'words' ? <Type className="w-3.5 h-3.5" /> : m === 'quote' ? <QuoteIcon className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
                <span>{m}</span>
              </button>
            ))}
          </div>

          {/* Value Options (Duration, Words Count, Length) */}
          <div className="flex items-center gap-1 border-l border-sub-theme/10 pl-1 sm:pl-4">
            {mode === 'time' && (
              <>
                <span className="font-mono text-[10px] text-sub-theme mr-2">time:</span>
                {([15, 30, 60, 120] as TimeOption[]).map((time) => (
                  <button
                    key={time}
                    id={`time-opt-${time}`}
                    onClick={() => setTimeOption(time)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all duration-150 cursor-pointer ${
                      timeOption === time
                        ? 'text-main-theme font-bold underline decoration-2 underline-offset-4'
                        : 'text-sub-theme hover:text-main-theme'
                    }`}
                  >
                    {time}s
                  </button>
                ))}
              </>
            )}

            {mode === 'words' && (
              <>
                <span className="font-mono text-[10px] text-sub-theme mr-2">words:</span>
                {([10, 25, 50, 100] as WordOption[]).map((word) => (
                  <button
                    key={word}
                    id={`word-opt-${word}`}
                    onClick={() => setWordOption(word)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all duration-150 cursor-pointer ${
                      wordOption === word
                        ? 'text-main-theme font-bold underline decoration-2 underline-offset-4'
                        : 'text-sub-theme hover:text-main-theme'
                    }`}
                  >
                    {word}
                  </button>
                ))}
              </>
            )}

            {mode === 'quote' && (
              <>
                <span className="font-mono text-[10px] text-sub-theme mr-2">length:</span>
                {(['short', 'medium', 'long'] as QuoteLength[]).map((len) => (
                  <button
                    key={len}
                    id={`quote-opt-${len}`}
                    onClick={() => setQuoteLength(len)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-sans font-semibold transition-all duration-150 cursor-pointer ${
                      quoteLength === len
                        ? 'text-main-theme font-bold underline decoration-2 underline-offset-4'
                        : 'text-sub-theme hover:text-main-theme'
                    }`}
                  >
                    {len}
                  </button>
                ))}
              </>
            )}

            {mode === 'zen' && (
              <span className="font-mono text-[10px] text-main-theme animate-pulse">
                ∞ practice mode (press Esc to stop)
              </span>
            )}
          </div>

          {/* WPM Goal Setting */}
          <div className="flex items-center gap-1.5 border-l border-sub-theme/10 pl-1 sm:pl-4">
            <span className="font-mono text-[10px] text-sub-theme mr-1">wpm goal:</span>
            <input
              type="number"
              min="0"
              max="300"
              placeholder="none"
              value={wpmGoal || ''}
              onChange={(e) => {
                const val = e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value, 10));
                setWpmGoal(val);
                localStorage.setItem('donkeytype-wpm-goal', val.toString());
              }}
              className="w-12 px-1 py-0.5 rounded bg-sub-theme/10 hover:bg-sub-theme/15 focus:bg-sub-theme/15 text-xs text-center font-mono font-bold text-main-theme border-none outline-none focus:ring-1 focus:ring-main-theme/40 transition-all duration-200"
              title="Set your target WPM Goal. Enter 0 or empty for no goal."
            />
            {wpmGoal > 0 && <span className="font-mono text-[10px] text-sub-theme">wpm</span>}
          </div>

          {/* Volume Slider Settings */}
          <div 
            id="volume-slider-container"
            className={`flex items-center gap-2 border-l border-sub-theme/10 pl-1 sm:pl-4 select-none transition-opacity duration-300 ${
              soundProfile === 'none' ? 'opacity-40' : 'opacity-100'
            }`}
          >
            <span className="font-mono text-[10px] text-sub-theme flex items-center gap-1" title={soundProfile === 'none' ? 'Sound is currently muted (enable in header)' : 'Adjust sound volume'}>
              {soundProfile === 'none' || soundVolume === 0 ? (
                <VolumeX className="w-3.5 h-3.5 text-sub-theme/60" />
              ) : soundVolume < 50 ? (
                <Volume1 className="w-3.5 h-3.5 text-sub-theme" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-sub-theme" />
              )}
              <span className="hidden xs:inline">volume:</span>
            </span>
            <input
              type="range"
              min="0"
              max="100"
              disabled={soundProfile === 'none'}
              value={soundVolume}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setSoundVolume(val);
                localStorage.setItem('donkeytype-sound-volume', val.toString());
              }}
              onMouseUp={() => {
                if (soundProfile !== 'none') {
                  playKeySound(soundProfile, false, soundVolume / 100);
                }
              }}
              onTouchEnd={() => {
                if (soundProfile !== 'none') {
                  playKeySound(soundProfile, false, soundVolume / 100);
                }
              }}
              className="w-16 sm:w-20 accent-main-theme bg-sub-theme/10 h-1 rounded-lg appearance-none cursor-pointer hover:bg-sub-theme/20 disabled:cursor-not-allowed transition-all duration-200"
              style={{
                background: `linear-gradient(to right, var(--main-theme) 0%, var(--main-theme) ${soundVolume}%, rgba(150, 150, 150, 0.1) ${soundVolume}%, rgba(150, 150, 150, 0.1) 100%)`
              }}
              title={soundProfile === 'none' ? 'Enable key sound in header to adjust volume' : `Volume: ${soundVolume}%`}
            />
            <span className="font-mono text-[10px] font-bold text-main-theme w-8 text-right">
              {soundProfile === 'none' ? 'off' : `${soundVolume}%`}
            </span>
          </div>
        </div>
      )}

      {/* Hidden Textarea Focus Trap */}
      <textarea
        ref={inputRef}
        value={currentTypedValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={() => setIsFocused(false)}
        className="opacity-0 absolute -z-50 pointer-events-none w-0 h-0"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck="false"
        data-enable-grammarly="false"
      />

      {/* Main Words Area Box */}
      <div 
        id="words-display-box"
        className="relative min-h-[160px] p-6 rounded-2xl bg-sub-theme/3 select-none cursor-text transition-all duration-300"
        onClick={triggerFocus}
      >
        {/* Real-time headsup counters */}
        <div className="flex items-center justify-between mb-4 h-6 font-mono text-sm">
          <div className="flex items-center gap-4">
            {/* Real-time clock/progress count */}
            <span className="text-main-theme font-bold">
              {mode === 'time' ? (
                <span>{timeLeft}s</span>
              ) : mode === 'words' ? (
                <span>{currentWordIndex}/{wordOption} words</span>
              ) : mode === 'quote' ? (
                <span>{currentWordIndex}/{wordsList.length} quote words</span>
              ) : (
                <span>zen typing</span>
              )}
            </span>

            {/* Live active stats */}
            {isTestStarted && (
              <span className="text-sub-theme text-xs animate-pulse">
                live wpm: <span className="text-main-theme font-bold">{liveWpm}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-sub-theme bg-sub-theme/10 px-2 py-0.5 rounded-md font-sans">
              Press <kbd className="font-mono font-bold text-main-theme">Tab</kbd> to restart
            </span>
          </div>
        </div>

        {/* Word wrap list wrapper */}
        <div 
          ref={wordsContainerRef}
          className="h-28 overflow-hidden relative no-scrollbar flex flex-wrap gap-x-2 gap-y-3 font-mono text-xl sm:text-2xl leading-relaxed text-sub-theme tracking-wide"
        >
          {wordsList.map((word, wordIdx) => {
            const isActive = wordIdx === currentWordIndex;
            const isCompleted = wordIdx < currentWordIndex;
            const typedWord = isCompleted ? typedHistory[wordIdx] : currentTypedValue;

            return (
              <div
                key={wordIdx}
                ref={isActive ? activeWordRef : null}
                id={`word-block-${wordIdx}`}
                className={`relative flex flex-wrap rounded px-1 transition-colors duration-150 ${
                  isActive ? 'bg-main-theme/5' : ''
                }`}
              >
                {/* Render normal characters */}
                {word.split('').map((char, charIdx) => {
                  let charClass = 'text-sub-theme/40'; // Untyped character standard opacity
                  let isCaretHere = false;

                  if (isActive) {
                    // Caret is exactly before this character
                    if (charIdx === currentTypedValue.length) {
                      isCaretHere = true;
                    }

                    if (charIdx < currentTypedValue.length) {
                      const typedChar = currentTypedValue[charIdx];
                      charClass = typedChar === char 
                        ? 'text-main-theme' 
                        : 'text-error-theme border-b-2 border-red-500/80';
                    }
                  } else if (isCompleted) {
                    // Past completed words
                    if (typedWord) {
                      if (charIdx < typedWord.length) {
                        const typedChar = typedWord[charIdx];
                        charClass = typedChar === char 
                          ? 'text-main-theme/80' 
                          : 'text-error-theme underline decoration-red-500/50';
                      } else {
                        // Character was missed entirely because user pressed spacebar early
                        charClass = 'text-error-theme/45 line-through';
                      }
                    } else {
                      charClass = 'text-error-theme/45 line-through';
                    }
                  }

                  return (
                    <span 
                      key={charIdx} 
                      className={`relative font-semibold ${charClass}`}
                    >
                      {/* Smooth custom sliding cursor */}
                      {isCaretHere && (
                        <span 
                          className="absolute -left-[2px] top-[10%] bottom-[10%] w-[2.5px] custom-caret"
                          style={{ backgroundColor: 'var(--caret-theme)' }}
                        />
                      )}
                      {char}
                    </span>
                  );
                })}

                {/* Render extra incorrect characters if typed beyond original word length */}
                {isActive && currentTypedValue.length > word.length && (
                  currentTypedValue.slice(word.length).split('').map((extraChar, extraIdx) => {
                    const charPosition = word.length + extraIdx;
                    const isCaretHere = charPosition === currentTypedValue.length;

                    return (
                      <span 
                        key={`extra-${extraIdx}`} 
                        className="text-red-400 font-bold border-b-2 border-red-600/80"
                      >
                        {isCaretHere && (
                          <span 
                            className="absolute -left-[2px] top-[10%] bottom-[10%] w-[2.5px] custom-caret"
                            style={{ backgroundColor: 'var(--caret-theme)' }}
                          />
                        )}
                        {extraChar}
                      </span>
                    );
                  })
                )}

                {/* Render extra completed characters from history */}
                {isCompleted && typedWord && typedWord.length > word.length && (
                  typedWord.slice(word.length).split('').map((extraChar, extraIdx) => (
                    <span 
                      key={`completed-extra-${extraIdx}`} 
                      className="text-red-400/60 font-medium underline decoration-red-600/30 text-xs sm:text-sm self-end"
                    >
                      {extraChar}
                    </span>
                  ))
                )}

                {/* Show caret after active word if we completed word length but haven't pressed space */}
                {isActive && currentTypedValue.length === word.length && (
                  <span className="relative w-[1px]">
                    <span 
                      className="absolute -left-[1px] top-[10%] bottom-[10%] w-[2.5px] custom-caret"
                      style={{ backgroundColor: 'var(--caret-theme)' }}
                    />
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Blur overlay when window is out of focus */}
        {!isFocused && (
          <div 
            id="blur-overlay"
            className="absolute inset-0 bg-bg-theme/90 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center text-center p-6 cursor-pointer select-none z-10 transition-all duration-300 animate-fadeIn"
          >
            <div className="w-12 h-12 rounded-full bg-main-theme/10 flex items-center justify-center mb-3 animate-pulse">
              <ShieldAlert className="w-6 h-6 text-main-theme" />
            </div>
            <h4 className="font-sans font-bold text-base text-main-theme mb-1">donkeytype is blurred</h4>
            <p className="font-mono text-xs text-sub-theme">Click here or press any key to focus typing block</p>
          </div>
        )}
      </div>

      {/* Restart / Quick Toggles Panel */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 select-none">
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick click sound switcher */}
          <div className="flex items-center gap-1.5 bg-sub-theme/5 px-3 py-1.5 rounded-xl border border-sub-theme/10">
            <Volume2 className="w-3.5 h-3.5 text-main-theme" />
            <span className="font-mono text-[10px] text-sub-theme">click sound:</span>
            {(['none', 'mechanical', 'click', 'typewriter'] as SoundProfile[]).map((p) => (
              <button
                key={p}
                id={`sound-btn-${p}`}
                onClick={() => onSoundChange(p)}
                className={`px-2 py-0.5 rounded text-[10px] font-sans font-semibold transition-all duration-150 cursor-pointer ${
                  soundProfile === p
                    ? 'bg-main-theme text-bg-theme font-bold'
                    : 'text-sub-theme hover:text-main-theme'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Focus Mode toggle */}
          <button
            id="focus-mode-toggle"
            onClick={() => {
              const newVal = !focusMode;
              setFocusMode(newVal);
              localStorage.setItem('donkeytype-focus-mode', newVal ? 'true' : 'false');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all duration-200 text-xs font-sans font-semibold cursor-pointer ${
              focusMode 
                ? 'bg-main-theme/10 border-main-theme/30 text-main-theme' 
                : 'bg-sub-theme/5 border-sub-theme/10 text-sub-theme hover:text-main-theme hover:border-main-theme/20'
            }`}
            title="Focus Mode: Hides header and footer when typing"
          >
            {focusMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>focus: {focusMode ? 'on' : 'off'}</span>
          </button>
        </div>

        {/* Manual Reset button */}
        <button
          id="manual-restart-btn"
          onClick={generateNewTest}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-sub-theme/20 text-sub-theme hover:text-main-theme hover:border-main-theme/40 active:scale-95 transition-all duration-200 font-sans font-semibold text-xs cursor-pointer"
          title="Restart Test (Tab)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>restart test (Tab)</span>
        </button>
      </div>

      {/* Zen / Escape instructions if test started */}
      {isTestStarted && (
        <p className="font-mono text-[10px] text-sub-theme text-center leading-none animate-pulse">
          {mode === 'zen' ? 'Press Esc or Tab to finish and calculate scores' : 'Press Tab to reset at any time'}
        </p>
      )}
    </div>
  );
}
