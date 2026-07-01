import React, { useState } from 'react';
import { HistoryItem } from '../types';
import { 
  Trash2, TrendingUp, Award, Activity, Keyboard, Calendar, ArrowRight, 
  Settings, ChevronRight, BarChart2, Zap, Trophy, Flame, Compass, Crown, Lock,
  Clock, Timer, Percent
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';

interface HistoryPanelProps {
  history: HistoryItem[];
  onClearHistory: () => void;
  onStartTest: () => void;
}

export default function HistoryPanel({ 
  history, 
  onClearHistory,
  onStartTest
}: HistoryPanelProps) {
  // Filter and view States
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [selectedMetric, setSelectedMetric] = useState<'wpm' | 'accuracy'>('wpm');

  // Calculate Lifetime stats
  const totalTests = history.length;
  
  const avgWpm = totalTests > 0 
    ? Math.round(history.reduce((sum, item) => sum + item.wpm, 0) / totalTests)
    : 0;

  const avgAccuracy = totalTests > 0
    ? Math.round(history.reduce((sum, item) => sum + item.accuracy, 0) / totalTests)
    : 0;

  const maxWpmItem = totalTests > 0
    ? history.reduce((max, item) => item.wpm > max.wpm ? item : max, history[0])
    : null;

  // Total time spent typing
  const totalTimeSeconds = history.reduce((sum, item) => sum + item.duration, 0);

  const formatTotalTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
  };

  // Last 5 tests average accuracy
  const last5Tests = [...history].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);
  const avgAccuracyLast5 = last5Tests.length > 0
    ? Math.round(last5Tests.reduce((sum, item) => sum + item.accuracy, 0) / last5Tests.length)
    : 0;

  // Comparison to find if user's accuracy has gotten better or worse over time
  const accuracyTrend = avgAccuracyLast5 - avgAccuracy;

  // Accuracy by modes
  const modeAccuracy = (['time', 'words', 'quote', 'zen'] as const).map(m => {
    const modeTests = history.filter(item => item.mode === m);
    const avg = modeTests.length > 0
      ? Math.round(modeTests.reduce((sum, item) => sum + item.accuracy, 0) / modeTests.length)
      : null;
    return { mode: m, avg, count: modeTests.length };
  });

  // Perfect accuracy tests count
  const perfectTestsCount = history.filter(item => item.accuracy === 100).length;

  // Format timestamp to readable string
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (totalTests === 0) {
    return (
      <div id="history-empty" className="max-w-md mx-auto text-center py-12 space-y-6 animate-fadeIn">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-sub-theme/5 flex items-center justify-center text-sub-theme/45">
          <Activity className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h3 className="font-sans font-bold text-lg text-text-theme">History is empty</h3>
          <p className="font-sans text-sm text-sub-theme leading-relaxed">
            Every test you complete will log statistics and chart your improvement here. Go take your first typing test!
          </p>
        </div>
        <button
          id="empty-start-test-btn"
          onClick={onStartTest}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-main-theme text-bg-theme font-sans font-bold hover:opacity-90 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <span>Start Typing</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Filter history based on chosen mode
  const filteredHistory = history.filter((item) => {
    if (selectedMode === 'all') return true;
    return item.mode === selectedMode;
  });

  // Prepare chronological data for Recharts (reverse of standard history which is newest first)
  const chartData = [...filteredHistory]
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((item, index) => ({
      index: index + 1,
      wpm: item.wpm,
      rawWpm: item.rawWpm,
      accuracy: item.accuracy,
      timestamp: item.timestamp,
      dateLabel: new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      mode: item.mode,
      duration: item.duration,
      difficulty: item.difficulty
    }));

  // Recharts Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3 bg-bg-theme border border-sub-theme/25 rounded-xl shadow-lg font-mono text-[11px] space-y-1.5 z-50 min-w-[140px]">
          <p className="text-sub-theme text-[9px] border-b border-sub-theme/10 pb-1 mb-1 font-bold">
            {new Date(data.timestamp).toLocaleString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          <div className="space-y-1">
            <p className="font-bold text-main-theme flex justify-between gap-4">
              <span>WPM:</span>
              <span>{data.wpm}</span>
            </p>
            <p className="text-sub-theme flex justify-between gap-4">
              <span>Raw:</span>
              <span>{data.rawWpm}</span>
            </p>
            <p className="text-emerald-400 font-medium flex justify-between gap-4">
              <span>Accuracy:</span>
              <span>{data.accuracy}%</span>
            </p>
          </div>
          <div className="text-sub-theme/70 capitalize text-[9px] border-t border-sub-theme/10 pt-1 mt-1.5 flex justify-between">
            <span>{data.mode}</span>
            <span>{data.duration}s</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Streak from localStorage
  const streak = (() => {
    const saved = localStorage.getItem('donkeytype_streak');
    return saved ? parseInt(saved, 10) : 0;
  })();

  const maxWpm = maxWpmItem?.wpm || 0;

  const modesPlayed = new Set(history.map((h) => h.mode));
  const hasTime = modesPlayed.has('time');
  const hasWords = modesPlayed.has('words');
  const hasQuote = modesPlayed.has('quote');
  const hasZen = modesPlayed.has('zen');
  const uniqueModesCount = [hasTime, hasWords, hasQuote, hasZen].filter(Boolean).length;

  const perfectAccuracyCount = history.filter((item) => item.accuracy === 100).length;

  const badges = [
    {
      id: 'novice',
      name: 'Novice Typer',
      description: 'Complete your first typing test to kick off your journey.',
      unlocked: totalTests >= 1,
      icon: <Keyboard className="w-5 h-5" />,
      progressPercent: totalTests >= 1 ? 100 : 0,
      progressText: `${Math.min(totalTests, 1)}/1 test`
    },
    {
      id: 'speed_demon',
      name: 'Speed Demon',
      description: 'Achieve a lightning-fast typing speed of 100+ WPM in any test.',
      unlocked: maxWpm >= 100,
      icon: <Zap className="w-5 h-5" />,
      progressPercent: Math.min(100, Math.round((maxWpm / 100) * 100)),
      progressText: `${maxWpm}/100 WPM`
    },
    {
      id: 'consistency_king',
      name: 'Consistency King',
      description: 'Maintain a daily typing streak of 3 or more days.',
      unlocked: streak >= 3,
      icon: <Crown className="w-5 h-5" />,
      progressPercent: Math.min(100, Math.round((streak / 3) * 100)),
      progressText: `${streak}/3 days`
    },
    {
      id: 'flawless',
      name: 'Flawless Finisher',
      description: 'Complete any typing test with a perfect 100% accuracy.',
      unlocked: perfectAccuracyCount > 0,
      icon: <Award className="w-5 h-5" />,
      progressPercent: perfectAccuracyCount > 0 ? 100 : 0,
      progressText: perfectAccuracyCount > 0 ? 'Completed!' : '0/1 perfect'
    },
    {
      id: 'polymath',
      name: 'Polymath',
      description: 'Complete a test in all four modes: time, words, quote, and zen.',
      unlocked: uniqueModesCount === 4,
      icon: <Compass className="w-5 h-5" />,
      progressPercent: Math.round((uniqueModesCount / 4) * 100),
      progressText: `${uniqueModesCount}/4 modes`
    },
    {
      id: 'marathoner',
      name: 'Marathoner',
      description: 'Complete 15 or more typing tests to prove your dedication.',
      unlocked: totalTests >= 15,
      icon: <Flame className="w-5 h-5" />,
      progressPercent: Math.min(100, Math.round((totalTests / 15) * 100)),
      progressText: `${totalTests}/15 tests`
    }
  ];

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div id="history-panel" className="max-w-4xl mx-auto py-2 space-y-8 animate-fadeIn">
      
      {/* Summary dashboard statistics */}
      <div id="stats-dashboard-grid" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Highest WPM */}
        <div className="bg-sub-theme/5 border border-sub-theme/10 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-main-theme/10 text-main-theme flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[10px] text-sub-theme tracking-wider uppercase">Personal Best</span>
            <span className="font-sans text-xl font-bold text-text-theme">{maxWpmItem?.wpm || 0} <span className="text-xs font-normal text-sub-theme">wpm</span></span>
          </div>
        </div>

        {/* Average Speed */}
        <div className="bg-sub-theme/5 border border-sub-theme/10 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-main-theme/10 text-main-theme flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[10px] text-sub-theme tracking-wider uppercase">Average Speed</span>
            <span className="font-sans text-xl font-bold text-text-theme">{avgWpm} <span className="text-xs font-normal text-sub-theme">wpm</span></span>
          </div>
        </div>

        {/* Completed Tests */}
        <div className="bg-sub-theme/5 border border-sub-theme/10 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-main-theme/10 text-main-theme flex items-center justify-center shrink-0">
            <Keyboard className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[10px] text-sub-theme tracking-wider uppercase">Tests Completed</span>
            <span className="font-sans text-xl font-bold text-text-theme">{totalTests}</span>
          </div>
        </div>

        {/* Avg Accuracy */}
        <div className="bg-sub-theme/5 border border-sub-theme/10 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-main-theme/10 text-main-theme flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[10px] text-sub-theme tracking-wider uppercase">Avg Accuracy</span>
            <span className="font-sans text-xl font-bold text-text-theme">{avgAccuracy}%</span>
          </div>
        </div>
      </div>

      {/* Achievements & Milestones Section */}
      <div id="milestones-card" className="bg-sub-theme/5 border border-sub-theme/10 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-sans font-bold text-sm text-text-theme flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-main-theme" />
              Achievements & Badges
            </h4>
            <p className="font-mono text-[10px] text-sub-theme">
              Unlock virtual badges based on your performance, speed, and consistency.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-sub-theme/10 px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold text-main-theme w-fit">
            <span>UNLOCKED:</span>
            <span>{unlockedCount} / {badges.length}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              id={`badge-card-${badge.id}`}
              className={`relative border rounded-2xl p-4 flex flex-col justify-between gap-3 transition-all duration-300 group ${
                badge.unlocked
                  ? 'bg-main-theme/[0.02] border-main-theme/20 hover:border-main-theme/40 hover:shadow-md hover:shadow-main-theme/[0.02]'
                  : 'bg-sub-theme/[0.02] border-sub-theme/5 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                  badge.unlocked 
                    ? 'bg-main-theme/10 text-main-theme shadow-sm shadow-main-theme/5' 
                    : 'bg-sub-theme/10 text-sub-theme/60'
                }`}>
                  {badge.unlocked ? badge.icon : <Lock className="w-4 h-4 text-sub-theme/40" />}
                </div>
                <div className="space-y-1">
                  <h5 className={`font-sans font-bold text-xs ${badge.unlocked ? 'text-text-theme' : 'text-sub-theme'}`}>
                    {badge.name}
                  </h5>
                  <p className="font-sans text-[10px] text-sub-theme leading-relaxed">
                    {badge.description}
                  </p>
                </div>
              </div>

              {/* Progress Bar & Text */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center font-mono text-[9px] text-sub-theme/80">
                  <span>Progress</span>
                  <span className="font-bold text-text-theme/90">{badge.progressText}</span>
                </div>
                <div className="w-full h-1.5 bg-sub-theme/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ease-out ${
                      badge.unlocked ? 'bg-main-theme' : 'bg-sub-theme/30'
                    }`}
                    style={{ width: `${badge.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Subtle badge glow on hover if unlocked */}
              {badge.unlocked && (
                <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-main-theme rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Analysis Section */}
      <div id="detailed-analysis-card" className="bg-sub-theme/5 border border-sub-theme/10 rounded-2xl p-6 space-y-6 animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-sans font-bold text-sm text-text-theme flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-main-theme" />
              Detailed Analysis
            </h4>
            <p className="font-mono text-[10px] text-sub-theme">
              Deep dive calculations on typing consistency, accuracy trends, and typing time.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Typing Time & Stamina */}
          <div className="space-y-4">
            <h5 className="font-sans font-bold text-xs text-text-theme border-b border-sub-theme/10 pb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-main-theme" />
              Time & Endurance Analytics
            </h5>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-sub-theme/10 p-4 rounded-xl space-y-1">
                <span className="font-mono text-[9px] text-sub-theme uppercase tracking-wider block">Total Typing Time</span>
                <span className="font-sans text-sm sm:text-base font-bold text-main-theme block truncate" title={formatTotalTime(totalTimeSeconds)}>
                  {formatTotalTime(totalTimeSeconds)}
                </span>
              </div>
              <div className="bg-sub-theme/10 p-4 rounded-xl space-y-1">
                <span className="font-mono text-[9px] text-sub-theme uppercase tracking-wider block">Average Test Length</span>
                <span className="font-sans text-sm sm:text-base font-bold text-text-theme block">
                  {totalTests > 0 ? `${Math.round(totalTimeSeconds / totalTests)}s` : '0s'}
                </span>
              </div>
            </div>

            <div className="space-y-2 bg-sub-theme/[0.02] border border-sub-theme/5 p-4 rounded-xl">
              <span className="font-mono text-[10px] text-sub-theme font-bold block">Test Distribution by Mode</span>
              <div className="space-y-1.5">
                {modeAccuracy.map(({ mode, count }) => {
                  const percent = totalTests > 0 ? Math.round((count / totalTests) * 100) : 0;
                  return (
                    <div key={mode} className="space-y-1">
                      <div className="flex justify-between items-center font-mono text-[9px] text-sub-theme">
                        <span className="capitalize">{mode}</span>
                        <span>{count} {count === 1 ? 'test' : 'tests'} ({percent}%)</span>
                      </div>
                      <div className="w-full h-1 bg-sub-theme/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-main-theme rounded-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Accuracy over Time & Trends */}
          <div className="space-y-4">
            <h5 className="font-sans font-bold text-xs text-text-theme border-b border-sub-theme/10 pb-2 flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-emerald-400" />
              Accuracy Progression & Trends
            </h5>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-sub-theme/10 p-4 rounded-xl space-y-1 relative">
                <span className="font-mono text-[9px] text-sub-theme uppercase tracking-wider block">Accuracy Trend (Last 5)</span>
                <div className="flex items-baseline gap-1">
                  <span className="font-sans text-base sm:text-lg font-bold text-text-theme block">
                    {avgAccuracyLast5}%
                  </span>
                  {accuracyTrend !== 0 && (
                    <span className={`font-mono text-[10px] font-bold ${
                      accuracyTrend > 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {accuracyTrend > 0 ? `+${accuracyTrend}%` : `${accuracyTrend}%`}
                    </span>
                  )}
                </div>
                <span className="font-sans text-[9px] text-sub-theme block leading-tight">
                  {accuracyTrend > 0 
                    ? 'Your precision is rising!' 
                    : accuracyTrend < 0 
                    ? 'Focus on typing control.' 
                    : 'Consistency maintained.'}
                </span>
              </div>
              
              <div className="bg-sub-theme/10 p-4 rounded-xl space-y-1">
                <span className="font-mono text-[9px] text-sub-theme uppercase tracking-wider block">Perfect Runs</span>
                <span className="font-sans text-base sm:text-lg font-bold text-emerald-400 block">
                  {perfectTestsCount} <span className="text-[10px] text-sub-theme font-normal font-mono">100% acc</span>
                </span>
                <span className="font-sans text-[9px] text-sub-theme block">
                  {perfectTestsCount > 0 ? 'Excellent finger control!' : 'Aim for zero errors!'}
                </span>
              </div>
            </div>

            <div className="space-y-2 bg-sub-theme/[0.02] border border-sub-theme/5 p-4 rounded-xl">
              <span className="font-mono text-[10px] text-sub-theme font-bold block">Average Accuracy by Mode</span>
              <div className="space-y-1.5">
                {modeAccuracy.map(({ mode, avg, count }) => {
                  return (
                    <div key={mode} className="flex justify-between items-center text-xs font-mono">
                      <span className="capitalize text-sub-theme">{mode} Mode</span>
                      {count > 0 ? (
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${
                            avg && avg >= 95 
                              ? 'text-emerald-400' 
                              : avg && avg >= 85 
                              ? 'text-amber-400' 
                              : 'text-red-400'
                          }`}>
                            {avg}%
                          </span>
                          <span className="text-[9px] text-sub-theme/60">({count} runs)</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-sub-theme/40">No runs yet</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Performance Trends Chart */}
      <div id="performance-trends-card" className="bg-sub-theme/5 border border-sub-theme/10 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h4 className="font-sans font-bold text-sm text-text-theme flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-main-theme" />
              Performance Trends
            </h4>
            <p className="font-mono text-[10px] text-sub-theme">
              Chronological progress tracking of speed and accuracy metrics.
            </p>
          </div>

          {/* Controls Menu */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Metric Toggle */}
            <div className="flex items-center gap-1 bg-sub-theme/10 p-1 rounded-xl text-xs font-sans">
              <button
                onClick={() => setSelectedMetric('wpm')}
                className={`px-3 py-1 rounded-lg transition-all font-semibold cursor-pointer ${
                  selectedMetric === 'wpm'
                    ? 'bg-main-theme text-bg-theme font-bold'
                    : 'text-sub-theme hover:text-main-theme'
                }`}
              >
                Speed (WPM)
              </button>
              <button
                onClick={() => setSelectedMetric('accuracy')}
                className={`px-3 py-1 rounded-lg transition-all font-semibold cursor-pointer ${
                  selectedMetric === 'accuracy'
                    ? 'bg-main-theme text-bg-theme font-bold'
                    : 'text-sub-theme hover:text-main-theme'
                }`}
              >
                Accuracy (%)
              </button>
            </div>

            {/* Mode Filter Dropdown */}
            <div className="flex items-center gap-1 bg-sub-theme/10 p-1 rounded-xl text-xs font-sans">
              {(['all', 'time', 'words', 'quote', 'zen'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMode(m)}
                  className={`px-2.5 py-1 rounded-lg transition-all capitalize font-semibold cursor-pointer ${
                    selectedMode === m
                      ? 'bg-main-theme/20 text-main-theme font-bold'
                      : 'text-sub-theme hover:text-main-theme'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recharts Component Container */}
        <div className="w-full h-64 sm:h-72 overflow-hidden relative">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={chartData} 
                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="currentColor" 
                  className="text-sub-theme/10" 
                  vertical={false}
                />
                <XAxis 
                  dataKey="index" 
                  stroke="var(--sub-theme)" 
                  fontSize={10} 
                  fontFamily="monospace"
                  tickLine={false}
                  dy={10}
                  tickFormatter={(val) => `#${val}`}
                />
                <YAxis 
                  stroke="var(--sub-theme)" 
                  fontSize={10} 
                  fontFamily="monospace"
                  tickLine={false}
                  dx={-10}
                  domain={selectedMetric === 'accuracy' ? [50, 100] : ['auto', 'auto']}
                />
                <Tooltip content={<CustomTooltip />} />
                
                {selectedMetric === 'wpm' ? (
                  <>
                    {/* Raw WPM Line */}
                    <Line 
                      type="monotone" 
                      dataKey="rawWpm" 
                      stroke="var(--sub-theme)" 
                      strokeWidth={1.5}
                      strokeDasharray="4 3"
                      dot={false}
                      name="Raw WPM"
                      className="opacity-40"
                    />
                    {/* Net WPM Line */}
                    <Line 
                      type="monotone" 
                      dataKey="wpm" 
                      stroke="var(--main-theme)" 
                      strokeWidth={3}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                      dot={{ r: 3, strokeWidth: 0, fill: 'var(--main-theme)' }}
                      name="Net WPM"
                    />
                  </>
                ) : (
                  <Line 
                    type="monotone" 
                    dataKey="accuracy" 
                    stroke="#10b981" // Emerald Green for accuracy
                    strokeWidth={3}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    dot={{ r: 3, strokeWidth: 0, fill: '#10b981' }}
                    name="Accuracy %"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-sub-theme/5 border border-dashed border-sub-theme/15 rounded-xl">
              <Zap className="w-8 h-8 text-sub-theme/40 mb-2 animate-bounce" />
              <p className="font-sans font-bold text-xs text-text-theme">No tests found for filter: "{selectedMode}"</p>
              <p className="font-mono text-[10px] text-sub-theme">Complete a test in this mode to see performance trends.</p>
            </div>
          )}
        </div>
      </div>

      {/* History Table Log */}
      <div className="bg-sub-theme/5 border border-sub-theme/10 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-sub-theme/10 flex items-center justify-between">
          <div>
            <h4 className="font-sans font-bold text-sm text-text-theme">Typing Test History</h4>
            <p className="font-mono text-[10px] text-sub-theme">Showing past runs sorted by newest first.</p>
          </div>

          <button
            id="clear-history-btn"
            onClick={() => {
              if (confirm('Are you sure you want to clear your typing history? This cannot be undone.')) {
                onClearHistory();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/10 text-red-400 hover:bg-red-500/10 text-xs font-sans font-medium transition-all duration-200 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-sub-theme/5 text-sub-theme uppercase text-[9px] tracking-wider bg-sub-theme/10">
                <th className="p-4 pl-6">Date / Time</th>
                <th className="p-4">Mode / Details</th>
                <th className="p-4 text-center">Accuracy</th>
                <th className="p-4 text-right">Raw WPM</th>
                <th className="p-4 text-right pr-6 text-main-theme">Net WPM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sub-theme/5">
              {history.map((item) => (
                <tr 
                  key={item.id} 
                  id={`history-row-${item.id}`}
                  className="hover:bg-sub-theme/10 transition-colors duration-150"
                >
                  <td className="p-4 pl-6 text-sub-theme flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-sub-theme/60" />
                    {formatDate(item.timestamp)}
                  </td>
                  <td className="p-4 text-text-theme font-semibold">
                    <span className="capitalize">{item.mode}</span> 
                    <span className="text-sub-theme font-normal text-[10px] ml-1.5">
                      ({item.duration}s, {item.difficulty})
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                      item.accuracy >= 95 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : item.accuracy >= 85 
                        ? 'bg-amber-500/10 text-amber-400' 
                        : 'bg-red-500/10 text-red-400'
                    }`}>
                      {item.accuracy}%
                    </span>
                  </td>
                  <td className="p-4 text-right text-sub-theme font-medium">{item.rawWpm}</td>
                  <td className="p-4 text-right pr-6 text-main-theme font-extrabold text-sm">{item.wpm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
