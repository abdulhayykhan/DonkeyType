export interface Theme {
  id: string;
  name: string;
  bg: string;          // Hex or custom style
  main: string;        // Active/Highlight color (primary)
  sub: string;         // Faded/Secondary color
  caret: string;       // Caret blinking color
  error: string;       // Wrong characters color
  text: string;        // Main text color
}

export type TypingMode = 'time' | 'words' | 'quote' | 'zen';

export type TimeOption = 15 | 30 | 60 | 120;
export type WordOption = 10 | 25 | 50 | 100;
export type QuoteLength = 'short' | 'medium' | 'long';
export type WordDifficulty = 'normal' | 'english1000' | 'code';
export type SoundProfile = 'none' | 'mechanical' | 'click' | 'typewriter';

export interface HistoryItem {
  id: string;
  timestamp: number;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  mode: TypingMode;
  difficulty: WordDifficulty;
  duration: number; // in seconds
  wordsCount: number;
  charsTyped: {
    correct: number;
    incorrect: number;
    extra: number;
    missed: number;
  };
  errorChars?: Record<string, number>;
}

export interface ChartDatapoint {
  second: number;
  wpm: number;
  rawWpm: number;
  errors: number;
}
