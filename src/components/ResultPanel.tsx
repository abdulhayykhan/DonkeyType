import React, { useState } from 'react';
import { motion } from 'motion/react';
import { HistoryItem, ChartDatapoint } from '../types';
import { RefreshCw, RotateCcw, Share2, Award, Sparkles, CheckCircle2, AlertTriangle, HelpCircle, Trophy, Send, Check, Twitter, Copy } from 'lucide-react';
import { db, collection, addDoc, serverTimestamp } from '../utils/firebase';

interface ResultPanelProps {
  historyItem: HistoryItem;
  chartData: ChartDatapoint[];
  onRestart: () => void;
  isPersonalBest: boolean;
  globalUsername: string;
  onSetGlobalUsername: (name: string) => void;
}

export default function ResultPanel({ 
  historyItem, 
  chartData, 
  onRestart,
  isPersonalBest,
  globalUsername,
  onSetGlobalUsername
}: ResultPanelProps) {
  const [hoveredPoint, setHoveredPoint] = useState<ChartDatapoint | null>(null);
  const [tooltipX, setTooltipX] = useState<number>(0);
  const [tooltipY, setTooltipY] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  // Calculate consistency based on standard deviation of WPM values
  const consistency = React.useMemo(() => {
    if (!chartData || chartData.length === 0) return 100;
    const wpms = chartData.map(d => d.wpm);
    const n = wpms.length;
    if (n <= 1) return 100;
    
    const mean = wpms.reduce((a, b) => a + b, 0) / n;
    if (mean === 0) return 0;
    
    const variance = wpms.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    
    const cv = stdDev / mean;
    const score = Math.max(0, Math.min(100, Math.round((1 - cv) * 100)));
    return score;
  }, [chartData]);

  // Framer motion variants for staggered child cards entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 90,
        damping: 14,
      },
    },
  };

  // Leaderboard states
  const [showSubmitForm, setShowSubmitForm] = useState<boolean>(false);
  const [username, setUsername] = useState<string>(globalUsername || localStorage.getItem('donkeytype-username') || '');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);


  // Handle score submission
  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) return;

    setSubmitting(true);
    
    try {
      // Save username to localStorage for subsequent sessions
      localStorage.setItem('donkeytype-username', trimmed);
      onSetGlobalUsername(trimmed);

      // Save score to Firestore
      const newEntry = {
        username: trimmed,
        wpm: historyItem.wpm,
        accuracy: historyItem.accuracy,
        mode: historyItem.mode,
        difficulty: historyItem.difficulty,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        createdAt: serverTimestamp(),
        timestamp: Date.now()
      };

      await addDoc(collection(db, 'leaderboard'), newEntry);

      // Save local backup reference for the current leaderboard tab (will merge or refresh when opened)
      const defaultLeaderboard: any[] = [];
      const saved = localStorage.getItem('donkeytype-leaderboard');
      let currentEntries = saved ? JSON.parse(saved) : defaultLeaderboard;
      
      if (Array.isArray(currentEntries)) {
        currentEntries = currentEntries.filter((e: any) => e && e.id && !e.id.toString().startsWith('mock-'));
      } else {
        currentEntries = [];
      }

      currentEntries.push({
        ...newEntry,
        id: `user-${Date.now()}`,
        isUser: true,
      });
      localStorage.setItem('donkeytype-leaderboard', JSON.stringify(currentEntries));

      setSubmitted(true);
    } catch (err) {
      console.error("Error submitting score to Firestore:", err);
      alert("Failed to submit score to the cloud. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Read target goal from localStorage
  const wpmGoal = (() => {
    const saved = localStorage.getItem('donkeytype-wpm-goal');
    return saved ? parseInt(saved, 10) : 0;
  })();

  // Calculate parameters for Custom SVG Chart
  const svgWidth = 600;
  const svgHeight = 180;
  const paddingLeft = 30;
  const paddingRight = 10;
  const paddingTop = 15;
  const paddingBottom = 20;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Find max WPM to scale chart
  const maxWpm = Math.max(
    ...chartData.map((d) => Math.max(d.wpm, d.rawWpm)),
    40 // minimum scale cap at 40 WPM
  );
  
  const pointsCount = chartData.length;

  // Convert a data point to SVG coordinates
  const getCoordinates = (index: number, value: number) => {
    if (pointsCount <= 1) {
      return { x: paddingLeft + chartWidth / 2, y: paddingTop + chartHeight / 2 };
    }
    const x = paddingLeft + (index / (pointsCount - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (value / maxWpm) * chartHeight;
    return { x, y };
  };

  // Generate SVG Path for WPM
  const generateLinePath = (key: 'wpm' | 'rawWpm') => {
    if (pointsCount < 2) return '';
    return chartData.map((d, i) => {
      const { x, y } = getCoordinates(i, d[key]);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  const wpmPath = generateLinePath('wpm');
  const rawWpmPath = generateLinePath('rawWpm');

  // Handle mouse hovering over the chart to show interactive tooltips
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (pointsCount < 2) return;
    const svgRect = e.currentTarget.getBoundingClientRect();
    const relativeX = e.clientX - svgRect.left;
    
    // Find closest index
    const chartRelativeX = relativeX - paddingLeft;
    const pct = Math.max(0, Math.min(1, chartRelativeX / chartWidth));
    const index = Math.round(pct * (pointsCount - 1));
    
    if (index >= 0 && index < pointsCount) {
      const point = chartData[index];
      setHoveredPoint(point);
      
      const coords = getCoordinates(index, point.wpm);
      setTooltipX(coords.x);
      setTooltipY(coords.y);
    }
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  // Copy result text to clipboard
  const handleCopyResult = () => {
    const textToCopy = `DonkeyType Test Result:
🚀 Speed: ${historyItem.wpm} WPM (Raw: ${historyItem.rawWpm} WPM)
🎯 Accuracy: ${historyItem.accuracy}%
🛠️ Mode: ${historyItem.mode} (${historyItem.duration}s)
🐴 Patience and accuracy wins the race!`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `My DonkeyType Test Result:\n🚀 Speed: ${historyItem.wpm} WPM (Raw: ${historyItem.rawWpm} WPM)\n🎯 Accuracy: ${historyItem.accuracy}%\n🛠️ Mode: ${historyItem.mode} (${historyItem.duration}s)\n🐴 Patience and accuracy wins the race!\n\nTry it at: ${window.location.origin}`
  )}`;

  // Character summary helper
  const totalChars = 
    historyItem.charsTyped.correct + 
    historyItem.charsTyped.incorrect + 
    historyItem.charsTyped.extra + 
    historyItem.charsTyped.missed;

  return (
    <div id="result-panel-container" className="max-w-4xl mx-auto py-2 animate-fadeIn space-y-8">
      {/* Celebration Header if Personal Best */}
      {isPersonalBest && (
        <div id="pb-celebration" className="bg-main-theme/10 border border-main-theme/30 rounded-2xl p-4 flex items-center justify-between gap-4 text-main-theme">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-main-theme/15 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-main-theme animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <h3 className="font-sans font-bold text-sm text-main-theme">New Personal Best!</h3>
              <p className="font-sans text-xs opacity-85">You typed with incredible control and patience.</p>
            </div>
          </div>
          <Award className="w-8 h-8 text-main-theme opacity-80" />
        </div>
      )}

      {/* Goal Target Notification */}
      {wpmGoal > 0 && (
        <div 
          id="goal-notification" 
          className={`border rounded-2xl p-4 flex items-center justify-between gap-4 transition-all duration-300 ${
            historyItem.wpm >= wpmGoal
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 animate-fadeIn'
              : 'bg-sub-theme/5 border-sub-theme/10 text-sub-theme animate-fadeIn'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              historyItem.wpm >= wpmGoal ? 'bg-emerald-500/15' : 'bg-sub-theme/10'
            }`}>
              {historyItem.wpm >= wpmGoal ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-sub-theme" />
              )}
            </div>
            <div>
              <h3 className="font-sans font-bold text-sm">
                {historyItem.wpm >= wpmGoal ? 'WPM Goal Achieved! 🎉' : 'WPM Goal Not Met'}
              </h3>
              <p className="font-sans text-xs opacity-85 leading-relaxed">
                {historyItem.wpm >= wpmGoal 
                  ? `Incredible job! You crushed your target goal of ${wpmGoal} WPM by typing ${historyItem.wpm} WPM.`
                  : `Your target goal was ${wpmGoal} WPM. You reached ${historyItem.wpm} WPM this run—keep practicing and you'll get there!`}
              </p>
            </div>
          </div>
          <div className="font-mono text-[10px] sm:text-xs font-bold px-3 py-1 bg-black/10 rounded-lg shrink-0">
            Goal: {wpmGoal} WPM
          </div>
        </div>
      )}

      {/* Primary Metrics Grid */}
      <motion.div 
        id="metrics-grid" 
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* WPM Card */}
        <motion.div 
          variants={cardVariants}
          className={`bg-sub-theme/5 border rounded-2xl p-6 flex flex-col justify-between h-32 relative group transition-all duration-300 ${
            wpmGoal > 0 && historyItem.wpm >= wpmGoal
              ? 'border-emerald-500/30 hover:border-emerald-500/50'
              : 'border-sub-theme/10 hover:border-main-theme/20'
          }`}
        >
          <div className="flex justify-between items-center w-full">
            <span className="font-mono text-xs text-sub-theme tracking-wider">wpm</span>
            {wpmGoal > 0 && (
              <span className={`font-mono text-[9px] px-2 py-0.5 rounded-full ${
                historyItem.wpm >= wpmGoal 
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 animate-pulse' 
                  : 'bg-sub-theme/15 text-sub-theme/75'
              }`}>
                goal: {wpmGoal} {historyItem.wpm >= wpmGoal ? '✓' : '✗'}
              </span>
            )}
          </div>
          <span className="font-sans text-5xl font-extrabold text-main-theme tracking-tight group-hover:scale-105 transition-transform duration-300">
            {historyItem.wpm}
          </span>
          <span className="font-mono text-[10px] text-sub-theme">net typed speed</span>
        </motion.div>

        {/* Accuracy Card */}
        <motion.div 
          variants={cardVariants}
          className="bg-sub-theme/5 border border-sub-theme/10 rounded-2xl p-6 flex flex-col justify-between h-32 relative group hover:border-main-theme/20 transition-all duration-300"
        >
          <span className="font-mono text-xs text-sub-theme tracking-wider">accuracy</span>
          <span className="font-sans text-5xl font-extrabold text-main-theme tracking-tight">
            {historyItem.accuracy}%
          </span>
          <span className="font-mono text-[10px] text-sub-theme">correct characters</span>
        </motion.div>

        {/* Consistency Card */}
        <motion.div 
          variants={cardVariants}
          className="bg-sub-theme/5 border border-sub-theme/10 rounded-2xl p-6 flex flex-col justify-between h-32 relative group hover:border-main-theme/20 transition-all duration-300"
        >
          <span className="font-mono text-xs text-sub-theme tracking-wider">consistency</span>
          <span className="font-sans text-5xl font-extrabold text-main-theme tracking-tight">
            {consistency}%
          </span>
          <span className="font-mono text-[10px] text-sub-theme">wpm stability score</span>
        </motion.div>

        {/* Raw WPM Card */}
        <motion.div 
          variants={cardVariants}
          className="bg-sub-theme/5 border border-sub-theme/10 rounded-2xl p-6 flex flex-col justify-between h-32 relative group hover:border-main-theme/20 transition-all duration-300"
        >
          <span className="font-mono text-xs text-sub-theme tracking-wider">raw wpm</span>
          <span className="font-sans text-4xl font-extrabold text-sub-theme tracking-tight">
            {historyItem.rawWpm}
          </span>
          <span className="font-mono text-[10px] text-sub-theme">including errors</span>
        </motion.div>

        {/* Details Card */}
        <motion.div 
          variants={cardVariants}
          className="bg-sub-theme/5 border border-sub-theme/10 rounded-2xl p-6 flex flex-col justify-between h-32"
        >
          <span className="font-mono text-xs text-sub-theme tracking-wider">test details</span>
          <div className="space-y-1">
            <div className="flex justify-between font-mono text-xs">
              <span className="text-sub-theme">type</span>
              <span className="text-text-theme font-semibold">{historyItem.mode}</span>
            </div>
            <div className="flex justify-between font-mono text-xs">
              <span className="text-sub-theme">time</span>
              <span className="text-text-theme font-semibold">{historyItem.duration}s</span>
            </div>
            <div className="flex justify-between font-mono text-xs">
              <span className="text-sub-theme">vocab</span>
              <span className="text-text-theme font-semibold">{historyItem.difficulty}</span>
            </div>
          </div>
          <span className="font-mono text-[10px] text-sub-theme">session setup</span>
        </motion.div>
      </motion.div>

      {/* SVG Timeline Chart */}
      <div id="chart-section" className="bg-sub-theme/5 border border-sub-theme/10 rounded-2xl p-6 relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div>
            <h4 className="font-sans font-bold text-sm text-text-theme">Performance Timeline</h4>
            <p className="font-mono text-[10px] text-sub-theme">Track your WPM progression over the course of the test.</p>
          </div>
          <div className="flex items-center gap-4 font-mono text-[10px]">
            <span className="flex items-center gap-1.5 text-main-theme">
              <span className="w-2.5 h-1 rounded-sm bg-main-theme" /> Net WPM
            </span>
            <span className="flex items-center gap-1.5 text-sub-theme">
              <span className="w-2.5 h-1 border-b border-dashed border-sub-theme" /> Raw WPM
            </span>
            <span className="flex items-center gap-1.5 text-red-500">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Mistakes
            </span>
          </div>
        </div>

        {/* Custom Interactive SVG Line Graph */}
        <div className="w-full relative overflow-visible mt-2">
          <svg
            id="results-chart"
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto cursor-crosshair select-none overflow-visible"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Gradients */}
            <defs>
              <linearGradient id="wpmGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--main-theme)" stopOpacity="0.2"/>
                <stop offset="100%" stopColor="var(--main-theme)" stopOpacity="0.0"/>
              </linearGradient>
            </defs>

            {/* Gridlines */}
            {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
              const val = Math.round(p * maxWpm);
              const y = paddingTop + chartHeight - p * chartHeight;
              return (
                <g key={i} className="opacity-10">
                  <line 
                    x1={paddingLeft} 
                    y1={y} 
                    x2={svgWidth - paddingRight} 
                    y2={y} 
                    stroke="currentColor" 
                    strokeWidth="1" 
                    strokeDasharray="3 3"
                    className="text-sub-theme"
                  />
                  <text 
                    x={paddingLeft - 8} 
                    y={y + 3} 
                    textAnchor="end" 
                    className="fill-current text-[8px] font-mono"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Fill Area for Net WPM */}
            {pointsCount >= 2 && (
              <path
                d={`${wpmPath} L ${getCoordinates(pointsCount - 1, 0).x} ${getCoordinates(pointsCount - 1, 0).y} L ${getCoordinates(0, 0).x} ${getCoordinates(0, 0).y} Z`}
                fill="url(#wpmGradient)"
              />
            )}

            {/* Raw WPM Line */}
            {rawWpmPath && (
              <path
                d={rawWpmPath}
                fill="none"
                stroke="var(--sub-theme)"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                className="opacity-40"
              />
            )}

            {/* Net WPM Main Solid Line */}
            {wpmPath && (
              <path
                d={wpmPath}
                fill="none"
                stroke="var(--main-theme)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Plot error dots if there are errors */}
            {chartData.map((d, i) => {
              if (d.errors > 0) {
                const { x } = getCoordinates(i, d.wpm);
                // Position error indicator at top/bottom of the chart relative to error density
                const y = paddingTop + chartHeight - 6;
                return (
                  <g key={i}>
                    {/* Tiny Red Crosses for Errors */}
                    <circle cx={x} cy={y} r="2.5" className="fill-red-500 animate-bounce" />
                    <text x={x} y={y - 5} textAnchor="middle" className="fill-red-500 font-mono text-[7px] font-bold">
                      {d.errors}
                    </text>
                  </g>
                );
              }
              return null;
            })}

            {/* Interactive Vertical Hover Guide line */}
            {hoveredPoint && (
              <line
                x1={getCoordinates(chartData.indexOf(hoveredPoint), hoveredPoint.wpm).x}
                y1={paddingTop}
                x2={getCoordinates(chartData.indexOf(hoveredPoint), hoveredPoint.wpm).x}
                y2={paddingTop + chartHeight}
                stroke="var(--main-theme)"
                strokeWidth="1"
                strokeDasharray="2 2"
                className="opacity-50"
              />
            )}

            {/* Interactive Tooltip inside SVG */}
            {hoveredPoint && (
              <g transform={`translate(${tooltipX > svgWidth - 100 ? tooltipX - 100 : tooltipX + 8}, ${tooltipY < 40 ? tooltipY + 25 : tooltipY - 25})`}>
                <rect
                  width="85"
                  height="45"
                  rx="6"
                  className="fill-bg-theme stroke-sub-theme/30"
                  strokeWidth="1"
                  filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
                />
                <text x="8" y="14" className="fill-current text-sub-theme font-mono text-[8px]">
                  second: {hoveredPoint.second}s
                </text>
                <text x="8" y="26" className="fill-current text-main-theme font-mono text-[9px] font-bold">
                  wpm: {hoveredPoint.wpm}
                </text>
                <text x="8" y="38" className="fill-current text-sub-theme font-mono text-[8px]">
                  raw: {hoveredPoint.rawWpm}
                </text>
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* Characters breakdown & visual panel */}
      <div id="character-breakdown" className="bg-sub-theme/5 border border-sub-theme/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-1 text-center md:text-left">
          <h4 className="font-sans font-bold text-sm text-text-theme">Character Statistics</h4>
          <p className="font-mono text-[10px] text-sub-theme">Key accuracy ratio over {totalChars} total key presses.</p>
        </div>

        <div className="flex items-center gap-6 sm:gap-12 flex-wrap justify-center">
          {/* Correct Keys */}
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <div className="flex flex-col font-mono">
              <span className="text-[10px] text-sub-theme leading-none">correct</span>
              <span className="text-base font-bold text-text-theme">{historyItem.charsTyped.correct}</span>
            </div>
          </div>

          {/* Incorrect Keys */}
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <div className="flex flex-col font-mono">
              <span className="text-[10px] text-sub-theme leading-none">incorrect</span>
              <span className="text-base font-bold text-red-500">{historyItem.charsTyped.incorrect}</span>
            </div>
          </div>

          {/* Extra characters typed */}
          <div className="flex items-center gap-2 text-amber-500">
            <div className="w-5 h-5 rounded-full border border-amber-500/30 flex items-center justify-center text-[10px] font-mono">
              +
            </div>
            <div className="flex flex-col font-mono">
              <span className="text-[10px] text-sub-theme leading-none">extra</span>
              <span className="text-base font-bold text-text-theme">{historyItem.charsTyped.extra}</span>
            </div>
          </div>

          {/* Missed / Uncorrected */}
          <div className="flex items-center gap-2 text-sub-theme/50">
            <HelpCircle className="w-5 h-5" />
            <div className="flex flex-col font-mono">
              <span className="text-[10px] text-sub-theme leading-none">missed</span>
              <span className="text-base font-bold text-text-theme">{historyItem.charsTyped.missed}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Struggle Heatmap Visualizer */}
      <div id="key-heatmap-section" className="bg-sub-theme/5 border border-sub-theme/10 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="font-sans font-bold text-sm text-text-theme flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-main-theme animate-pulse" />
              Keyboard Struggle Heatmap
            </h4>
            <p className="font-mono text-[10px] text-sub-theme">
              Identifies which keys caused the most errors or misses in this session.
            </p>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono text-sub-theme">
            <span>Perfect</span>
            <div className="flex items-center gap-1 bg-sub-theme/5 p-1 rounded-md border border-sub-theme/10">
              <span className="w-2.5 h-2.5 rounded-sm bg-sub-theme/10 border border-sub-theme/15" />
              <span className="w-2.5 h-2.5 rounded-sm bg-red-500/20 border border-red-500/30" />
              <span className="w-2.5 h-2.5 rounded-sm bg-red-500/50 border border-red-500/60" />
              <span className="w-2.5 h-2.5 rounded-sm bg-red-500 border border-red-600" />
            </div>
            <span className="text-red-400">High Errors</span>
          </div>
        </div>

        {(() => {
          const keyboardRows = [
            ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
            ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
            ['z', 'x', 'c', 'v', 'b', 'n', 'm']
          ];
          const errorMap = historyItem.errorChars || {};
          const struggledKeys = Object.entries(errorMap)
            .filter(([key, count]) => count > 0 && key.length === 1)
            .sort((a, b) => b[1] - a[1]);
          const totalErrors = struggledKeys.reduce((sum, [_, count]) => sum + count, 0);

          return struggledKeys.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Visual Keyboard Grid */}
              <div className="md:col-span-2 flex flex-col gap-1.5 items-center bg-black/10 dark:bg-black/25 p-4 rounded-xl border border-sub-theme/5">
                {keyboardRows.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex gap-1 justify-center w-full">
                    {/* Row indentation offset */}
                    {rowIndex === 1 && <div className="w-1.5 sm:w-3" />}
                    {rowIndex === 2 && <div className="w-3 sm:w-6" />}
                    
                    {row.map((key) => {
                      const errorCount = errorMap[key] || 0;
                      const maxErrorCount = Math.max(...Object.values(errorMap).filter((_, idx) => Object.keys(errorMap)[idx] !== ' '), 1);
                      const intensity = errorCount / maxErrorCount;
                      
                      let keyBgClass = "bg-sub-theme/10 text-sub-theme/60 border-sub-theme/5";
                      if (errorCount > 0) {
                        if (intensity < 0.35) {
                          keyBgClass = "bg-red-500/20 text-red-400 border-red-500/30 font-semibold";
                        } else if (intensity < 0.7) {
                          keyBgClass = "bg-red-500/50 text-white border-red-500/60 font-semibold";
                        } else {
                          keyBgClass = "bg-red-500 text-white border-red-600 font-bold shadow-sm shadow-red-500/20 animate-pulse";
                        }
                      }

                      return (
                        <div
                          key={key}
                          title={errorCount > 0 ? `'${key}': ${errorCount} error${errorCount > 1 ? 's' : ''}` : `'${key}': flawless`}
                          className={`w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-md border text-xs sm:text-sm font-mono uppercase transition-all duration-200 select-none ${keyBgClass}`}
                        >
                          {key}
                        </div>
                      );
                    })}
                    {rowIndex === 1 && <div className="w-1.5 sm:w-3" />}
                    {rowIndex === 2 && <div className="w-3 sm:w-6" />}
                  </div>
                ))}
              </div>

              {/* Most Frequent Character Errors Breakdown */}
              <div className="space-y-3">
                <h5 className="font-mono text-xs font-bold text-text-theme flex items-center justify-between">
                  <span>Frequent Errors</span>
                  <span className="text-[10px] text-sub-theme font-normal">
                    {totalErrors} total error{totalErrors > 1 ? 's' : ''}
                  </span>
                </h5>
                <div className="space-y-2 max-h-[170px] overflow-y-auto pr-2 scrollbar-thin">
                  {struggledKeys.map(([char, count]) => {
                    const percentage = totalErrors > 0 ? Math.round((count / totalErrors) * 100) : 0;
                    const isSpace = char === ' ';
                    
                    return (
                      <div key={char} className="flex flex-col gap-1.5 p-2 rounded-xl bg-sub-theme/5 border border-sub-theme/10 hover:border-main-theme/15 transition-all duration-200">
                        <div className="flex items-center justify-between font-mono text-xs">
                          <span className="flex items-center gap-2">
                            {isSpace ? (
                              <span className="px-1.5 py-0.5 flex items-center justify-center rounded bg-red-500/15 border border-red-500/30 text-red-400 font-bold text-[9px] tracking-wider uppercase">
                                space
                              </span>
                            ) : (
                              <span className="w-5 h-5 flex items-center justify-center rounded bg-red-500/15 border border-red-500/30 text-red-400 uppercase font-bold text-[10px]">
                                {char}
                              </span>
                            )}
                            <span className="text-[11px] text-sub-theme font-sans">mistakes</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="text-red-400 font-bold">{count}</span>
                            <span className="text-[10px] text-sub-theme">({percentage}%)</span>
                          </span>
                        </div>
                        {/* Visual distribution progress bar */}
                        <div className="w-full h-1 bg-sub-theme/10 rounded-full overflow-hidden relative">
                          <motion.div 
                            className="absolute left-0 top-0 h-full bg-red-500/60 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="font-sans text-[10px] text-sub-theme leading-relaxed">
                  Avoid rushing. Slow down and build proper muscle memory for these highlighted characters to reduce mistakes and boost net speed.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-2 border border-dashed border-emerald-500/20 rounded-xl bg-emerald-500/5">
              <Sparkles className="w-8 h-8 text-emerald-400 animate-bounce" />
              <h5 className="font-sans font-bold text-xs text-emerald-400">100% Perfect Typing Precision!</h5>
              <p className="font-mono text-[10px] text-sub-theme/80 max-w-sm">
                Incredible typing session. No keys were incorrect or missed. Your raw speed matches your net speed flawlessly!
              </p>
            </div>
          );
        })()}
      </div>

      {/* Submit Score Form */}
      {showSubmitForm && (
        <div id="leaderboard-submit-box" className="bg-sub-theme/5 border border-sub-theme/10 rounded-2xl p-5 space-y-4 max-w-md mx-auto animate-fadeIn">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-main-theme" />
            <h4 className="font-sans font-bold text-sm text-text-theme">Submit Score to Leaderboard</h4>
          </div>
          {submitted ? (
            <div className="flex flex-col items-center py-4 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 animate-bounce">
                <Check className="w-5 h-5" />
              </div>
              <p className="font-sans font-bold text-xs text-emerald-400">Score Submitted Successfully! 🎉</p>
              <p className="font-sans text-[11px] text-sub-theme">Your rank has been recorded in the local leaderboard.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitScore} className="space-y-3">
              <p className="font-sans text-[11px] text-sub-theme leading-relaxed">
                Enter your nickname below to publish your score of <strong>{historyItem.wpm} WPM</strong> ({historyItem.accuracy}% accuracy) to the community leaderboard.
              </p>
              <div className="flex gap-2">
                <input
                  id="leaderboard-username-input"
                  type="text"
                  required
                  maxLength={15}
                  placeholder="Enter username..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="flex-grow px-3 py-2 text-xs rounded-xl bg-sub-theme/10 text-text-theme border-none outline-none focus:ring-1 focus:ring-main-theme/40 transition-all duration-200"
                />
                <button
                  type="submit"
                  disabled={submitting || !username.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-main-theme text-bg-theme font-sans font-bold text-xs hover:opacity-90 disabled:opacity-50 transition-all duration-200 cursor-pointer"
                >
                  {submitting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>{submitting ? 'submitting...' : 'submit'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Reset & Action Buttons */}
      <div id="result-actions" className="flex flex-wrap items-center justify-center gap-4 py-2">
        <button
          id="restart-test-btn"
          onClick={onRestart}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-main-theme text-bg-theme font-sans font-bold hover:opacity-90 active:scale-95 transition-all duration-200 shadow-sm cursor-pointer"
        >
          <RotateCcw className="w-4.5 h-4.5" />
          <span>Type Again (Enter)</span>
        </button>

        {!submitted && (
          <button
            id="open-submit-board-btn"
            onClick={() => setShowSubmitForm(!showSubmitForm)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl border font-sans font-medium hover:bg-sub-theme/5 active:scale-95 transition-all duration-200 cursor-pointer ${
              showSubmitForm 
                ? 'border-main-theme bg-main-theme/10 text-main-theme' 
                : 'border-sub-theme/20 text-sub-theme hover:text-main-theme'
            }`}
          >
            <Trophy className="w-4.5 h-4.5" />
            <span>Submit Score</span>
          </button>
        )}

        <button
          id="copy-result-btn"
          onClick={handleCopyResult}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl border font-sans font-medium hover:bg-sub-theme/5 active:scale-95 transition-all duration-200 cursor-pointer ${
            copied 
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/15'
              : 'border-sub-theme/20 text-sub-theme hover:text-main-theme'
          }`}
        >
          {copied ? <Check className="w-4.5 h-4.5" /> : <Copy className="w-4.5 h-4.5" />}
          <span>{copied ? 'Copied Results!' : 'Copy Results'}</span>
        </button>

        <a
          id="share-twitter-btn"
          href={twitterUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-5 py-3 rounded-xl border border-sub-theme/20 text-sub-theme hover:text-main-theme hover:border-main-theme/50 hover:bg-sub-theme/5 active:scale-95 transition-all duration-200 cursor-pointer font-sans font-medium"
        >
          <Twitter className="w-4.5 h-4.5 text-[#1DA1F2]" />
          <span>Share on Twitter</span>
        </a>
      </div>
    </div>
  );
}
