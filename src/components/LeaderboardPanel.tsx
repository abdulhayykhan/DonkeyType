import { useState, useEffect } from 'react';
import { 
  Trophy, Medal, Search, RefreshCw, Crown, Sparkles, User, Calendar, 
  Clock, Type, Quote, Activity, ShieldAlert
} from 'lucide-react';
import { TypingMode } from '../types';
import { db, collection, getDocs, query, orderBy, limit } from '../utils/firebase';

export interface LeaderboardEntry {
  id: string;
  username: string;
  wpm: number;
  accuracy: number;
  mode: TypingMode;
  difficulty: string;
  date: string;
  isUser?: boolean;
}

const DEFAULT_LEADERBOARD_ENTRIES: LeaderboardEntry[] = [];

export default function LeaderboardPanel() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMode, setSelectedMode] = useState<TypingMode | 'all'>('all');
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Load scores
  useEffect(() => {
    fetchScores();
  }, []);

  const fetchScores = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // Fetch top 100 scores from Firestore ordered by speed then accuracy
      const q = query(
        collection(db, 'leaderboard'),
        orderBy('wpm', 'desc'),
        orderBy('accuracy', 'desc'),
        limit(100)
      );

      const querySnapshot = await getDocs(q);
      const fetchedEntries: LeaderboardEntry[] = [];
      const localUsername = localStorage.getItem('donkeytype-username') || '';

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedEntries.push({
          id: doc.id,
          username: data.username || 'Anonymous',
          wpm: data.wpm || 0,
          accuracy: data.accuracy || 0,
          mode: data.mode || 'time',
          difficulty: data.difficulty || 'normal',
          date: data.date || '',
          isUser: localUsername && data.username === localUsername,
        });
      });

      setEntries(fetchedEntries);
      localStorage.setItem('donkeytype-leaderboard', JSON.stringify(fetchedEntries));
    } catch (error) {
      console.error("Error fetching Firestore leaderboard:", error);
      // Fallback to local storage cache if database is currently inaccessible
      const saved = localStorage.getItem('donkeytype-leaderboard');
      if (saved) {
        try {
          setEntries(JSON.parse(saved));
        } catch (e) {
          setEntries([]);
        }
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filter and sort entries
  const filteredEntries = entries
    .filter((entry) => {
      const matchesSearch = entry.username.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMode = selectedMode === 'all' || entry.mode === selectedMode;
      return matchesSearch && matchesMode;
    })
    .sort((a, b) => {
      if (b.wpm !== a.wpm) {
        return b.wpm - a.wpm; // Higher WPM first
      }
      return b.accuracy - a.accuracy; // Tie-breaker: higher accuracy first
    });

  // Get stats
  const averageWpm = filteredEntries.length > 0 
    ? Math.round(filteredEntries.reduce((sum, e) => sum + e.wpm, 0) / filteredEntries.length)
    : 0;

  const topWpm = filteredEntries.length > 0 ? filteredEntries[0].wpm : 0;

  return (
    <div id="leaderboard-panel" className="max-w-4xl mx-auto py-2 space-y-8 animate-fadeIn">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-sub-theme/10 pb-6">
        <div>
          <h2 className="font-sans font-bold text-2xl text-text-theme flex items-center gap-2">
            <Trophy className="w-6 h-6 text-main-theme" />
            Global Community Leaderboard
          </h2>
          <p className="font-mono text-xs text-sub-theme">
            Real-time community scores synchronized across all devices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="refresh-leaderboard-btn"
            onClick={() => fetchScores(true)}
            disabled={loading || refreshing}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-sub-theme/5 hover:bg-sub-theme/10 text-sub-theme hover:text-main-theme transition-all duration-200 cursor-pointer disabled:opacity-50 text-xs font-mono font-bold"
            title="Refresh leaderboard data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'refreshing...' : 'refresh'}
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-sub-theme/5 border border-sub-theme/10 rounded-2xl p-5 flex flex-col justify-between h-24">
          <span className="font-mono text-[10px] text-sub-theme uppercase tracking-wider">Top speed</span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-sans text-3xl font-extrabold text-main-theme tracking-tight">{topWpm}</span>
            <span className="font-mono text-[10px] text-sub-theme font-bold">WPM</span>
          </div>
        </div>

        <div className="bg-sub-theme/5 border border-sub-theme/10 rounded-2xl p-5 flex flex-col justify-between h-24">
          <span className="font-mono text-[10px] text-sub-theme uppercase tracking-wider">Average speed</span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-sans text-3xl font-extrabold text-main-theme tracking-tight">{averageWpm}</span>
            <span className="font-mono text-[10px] text-sub-theme font-bold">WPM</span>
          </div>
        </div>

        <div className="bg-sub-theme/5 border border-sub-theme/10 rounded-2xl p-5 flex flex-col justify-between h-24">
          <span className="font-mono text-[10px] text-sub-theme uppercase tracking-wider">Total competitors</span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-sans text-3xl font-extrabold text-main-theme tracking-tight">{filteredEntries.length}</span>
            <span className="font-mono text-[10px] text-sub-theme font-bold">ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-sub-theme/5 p-4 rounded-2xl border border-sub-theme/10">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-sub-theme absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="leaderboard-search"
            type="text"
            placeholder="Search competitor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-sub-theme/10 text-xs text-text-theme placeholder-sub-theme border-none outline-none focus:ring-1 focus:ring-main-theme/40 transition-all duration-200 font-sans"
          />
        </div>

        {/* Mode filter tabs */}
        <div className="flex items-center gap-1 bg-sub-theme/10 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          {(['all', 'time', 'words', 'quote', 'zen'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setSelectedMode(mode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold capitalize transition-all duration-200 cursor-pointer whitespace-nowrap ${
                selectedMode === mode
                  ? 'bg-main-theme/20 text-main-theme shadow-xs'
                  : 'text-sub-theme hover:text-main-theme'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table/List */}
      <div className="bg-sub-theme/5 border border-sub-theme/10 rounded-2xl overflow-hidden relative">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-main-theme animate-spin" />
            <span className="font-mono text-xs text-sub-theme animate-pulse">fetching top scores...</span>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <ShieldAlert className="w-8 h-8 text-sub-theme/55 mx-auto" />
            <p className="font-sans text-sm text-sub-theme">No matching scores found.</p>
            <p className="font-mono text-[10px] text-sub-theme/60">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-sub-theme/10 font-mono text-[10px] text-sub-theme uppercase select-none">
                  <th className="py-4 px-6 text-center w-16">Rank</th>
                  <th className="py-4 px-4">Competitor</th>
                  <th className="py-4 px-4 text-right">WPM</th>
                  <th className="py-4 px-4 text-right">Accuracy</th>
                  <th className="py-4 px-4 text-center">Setup</th>
                  <th className="py-4 px-6 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sub-theme/5">
                {filteredEntries.map((entry, index) => {
                  const rank = index + 1;
                  const isTop3 = rank <= 3;
                  
                  return (
                    <tr 
                      key={entry.id}
                      id={`leaderboard-row-${entry.id}`}
                      className={`hover:bg-sub-theme/5 transition-colors duration-150 font-sans group ${
                        entry.isUser ? 'bg-main-theme/[0.03]' : ''
                      }`}
                    >
                      {/* Rank Column */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center">
                          {rank === 1 ? (
                            <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500" title="First Place">
                              <Crown className="w-4 h-4 fill-amber-500/10" />
                            </div>
                          ) : rank === 2 ? (
                            <div className="w-6 h-6 rounded-full bg-slate-400/10 flex items-center justify-center text-slate-400" title="Second Place">
                              <Medal className="w-4 h-4" />
                            </div>
                          ) : rank === 3 ? (
                            <div className="w-6 h-6 rounded-full bg-amber-700/10 flex items-center justify-center text-amber-700" title="Third Place">
                              <Medal className="w-4 h-4" />
                            </div>
                          ) : (
                            <span className="font-mono text-xs text-sub-theme font-semibold">#{rank}</span>
                          )}
                        </div>
                      </td>

                      {/* Name Column */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <User className={`w-3.5 h-3.5 shrink-0 ${entry.isUser ? 'text-main-theme' : 'text-sub-theme/60'}`} />
                          <span className={`font-sans text-xs font-bold ${
                            entry.isUser ? 'text-main-theme' : 'text-text-theme'
                          }`}>
                            {entry.username}
                          </span>
                          {entry.isUser && (
                            <span className="font-mono text-[8px] bg-main-theme/10 text-main-theme px-1.5 py-0.5 rounded uppercase font-extrabold tracking-wider animate-pulse">
                              YOU
                            </span>
                          )}
                        </div>
                      </td>

                      {/* WPM Column */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-sans text-sm font-extrabold text-text-theme">
                            {entry.wpm}
                          </span>
                          <span className="font-mono text-[8px] text-sub-theme uppercase">wpm</span>
                        </div>
                      </td>

                      {/* Accuracy Column */}
                      <td className="py-4 px-4 text-right">
                        <span className={`font-sans text-xs font-semibold ${
                          entry.accuracy === 100 ? 'text-emerald-400' : 'text-text-theme/90'
                        }`}>
                          {entry.accuracy}%
                        </span>
                      </td>

                      {/* Setup Column */}
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-sub-theme/10 text-[9px] font-mono text-sub-theme font-bold">
                          {entry.mode === 'time' && <Clock className="w-2.5 h-2.5" />}
                          {entry.mode === 'words' && <Type className="w-2.5 h-2.5" />}
                          {entry.mode === 'quote' && <Quote className="w-2.5 h-2.5" />}
                          {entry.mode === 'zen' && <Activity className="w-2.5 h-2.5" />}
                          <span>{entry.mode}</span>
                          <span className="opacity-50">/</span>
                          <span className="text-text-theme">{entry.difficulty}</span>
                        </div>
                      </td>

                      {/* Date Column */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1 font-mono text-[10px] text-sub-theme">
                          <Calendar className="w-3 h-3 text-sub-theme/40" />
                          <span>{entry.date}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Helpful info banner */}
      <div className="border border-main-theme/10 bg-main-theme/[0.02] rounded-2xl p-4 flex gap-3 items-start">
        <Sparkles className="w-4 h-4 text-main-theme shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-sans font-bold text-xs text-text-theme">How to join the board?</h4>
          <p className="font-sans text-[11px] text-sub-theme leading-relaxed">
            Whenever you finish a typing test, you can submit your score to this global cloud leaderboard using the 
            <strong> "Submit Score"</strong> action. Challenge yourself to conquer the ranks!
          </p>
        </div>
      </div>
    </div>
  );
}
