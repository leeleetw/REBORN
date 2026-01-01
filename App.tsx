
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { GameState, DailyTasks, GameStats, DayRecord } from './types';
import Avatar from './components/Avatar';
import BattleSystem from './components/BattleSystem';
import { generateCatImage, getFinalBlessing, getPettingQuote } from './services/geminiService';

const INITIAL_STATS: GameStats = {
  totalExp: 0,
  totalBattlesWon: 0,
  totalWaterDrunk: 0,
  totalPatrols: 0,
  totalShields: 0,
  startDate: new Date().toLocaleDateString(),
};

const INITIAL_STATE: GameState = {
  level: 1,
  exp: 0,
  hp: 100,
  mp: 50,
  shieldActive: false,
  streak: 1,
  lastUpdated: new Date().toDateString(),
  tasks: {
    morningElixir: false,
    postMealPatrol: 0,
    mindShield: false,
  },
  wins: [],
  stats: INITIAL_STATS,
  history: [],
};

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const App: React.FC = () => {
  const [state, setState] = useState<GameState>(() => {
    const saved = localStorage.getItem('reborn_save_v99_final_v7');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.lastUpdated !== new Date().toDateString()) {
        const yesterdayTasks = (parsed.tasks.morningElixir ? 1 : 0) + 
                                (parsed.tasks.postMealPatrol >= 3 ? 1 : 0) + 
                                (parsed.tasks.mindShield ? 1 : 0);
        
        const newRecord: DayRecord = {
          date: parsed.lastUpdated,
          tasksCompleted: yesterdayTasks,
          battleResult: parsed.lastBattleResult || 'none', 
          wins: parsed.wins || []
        };
        const isConsecutive = (new Date(parsed.lastUpdated).getTime() + 86400000) >= new Date().setHours(0,0,0,0);
        
        return {
          ...parsed,
          lastUpdated: new Date().toDateString(),
          tasks: INITIAL_STATE.tasks,
          wins: [],
          lastBattleResult: 'none',
          shieldActive: false,
          mp: Math.min(100, parsed.mp + 20),
          hp: Math.min(100, parsed.hp + 5),
          streak: isConsecutive ? parsed.streak + 1 : 1,
          history: [...(parsed.history || []), newRecord].slice(-150)
        };
      }
      return parsed;
    }
    return INITIAL_STATE;
  });

  const [theme, setTheme] = useState<'day' | 'night'>(() => {
    return (localStorage.getItem('reborn_theme') as 'day' | 'night') || 'day';
  });

  const [catImageUrl, setCatImageUrl] = useState<string | null>(localStorage.getItem('cat_image_cache'));
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [showBattle, setShowBattle] = useState(false);
  const [showWinInput, setShowWinInput] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showBlessing, setShowBlessing] = useState(false);
  const [finalBlessingText, setFinalBlessingText] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<DayRecord | null>(null);
  const [winTexts, setWinTexts] = useState(['', '', '']);
  const [notif, setNotif] = useState<string | null>(null);
  const [isLevelingUp, setIsLevelingUp] = useState(false);
  const [isPetting, setIsPetting] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isHudCollapsed, setIsHudCollapsed] = useState(false);
  
  const particleIdCounter = useRef(0);

  const fullHistory = useMemo(() => {
    const todayRecord: DayRecord = {
      date: state.lastUpdated,
      tasksCompleted: (state.tasks.morningElixir ? 1 : 0) + 
                       (state.tasks.postMealPatrol >= 3 ? 1 : 0) + 
                       (state.tasks.mindShield ? 1 : 0),
      battleResult: 'none',
      wins: state.wins || []
    };
    return [...state.history, todayRecord];
  }, [state.history, state.lastUpdated, state.tasks, state.wins]);

  const calendarPadding = useMemo(() => {
    if (fullHistory.length === 0) return 0;
    const firstDate = new Date(fullHistory[0].date);
    const day = firstDate.getDay(); 
    return day === 0 ? 6 : day - 1; 
  }, [fullHistory]);

  const notify = useCallback((msg: string) => {
    setNotif(msg);
    setTimeout(() => setNotif(null), 3000);
  }, []);

  const playCoinSfx = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc1 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc1.type = 'square';
      const now = audioCtx.currentTime;
      osc1.frequency.setValueAtTime(987.77, now);
      osc1.frequency.setValueAtTime(1318.51, now + 0.08);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc1.connect(gain);
      gain.connect(audioCtx.destination);
      osc1.start();
      osc1.stop(now + 0.5);
    } catch (e) {}
  };

  const handlePetting = async (e: React.MouseEvent) => {
    playCoinSfx();
    setIsPetting(true);
    
    // 噴發粒子效果
    const newParticles: Particle[] = Array.from({ length: 12 }).map(() => ({
      id: particleIdCounter.current++,
      x: e.clientX,
      y: e.clientY,
      vx: (Math.random() - 0.5) * 15,
      vy: (Math.random() - 0.5) * 15 - 5,
    }));
    setParticles(prev => [...prev, ...newParticles]);

    // 即時獲取資料庫語錄
    const quote = await getPettingQuote(state.level);
    notify(quote);
    
    setTimeout(() => setIsPetting(false), 300);
  };

  useEffect(() => {
    if (particles.length === 0) return;
    const interval = setInterval(() => {
      setParticles(prev => prev
        .map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, vy: p.vy + 0.5 }))
        .filter(p => p.y < window.innerHeight && p.x > 0 && p.x < window.innerWidth)
      );
    }, 16);
    return () => clearInterval(interval);
  }, [particles]);

  const fetchCatImage = useCallback(async (lv: number) => {
    setIsLoadingImage(true);
    const url = await generateCatImage(lv);
    if (url) {
      setCatImageUrl(url);
      localStorage.setItem('cat_image_cache', url);
    }
    setIsLoadingImage(false);
  }, []);

  useEffect(() => {
    if (!catImageUrl) fetchCatImage(state.level);
  }, [catImageUrl, fetchCatImage, state.level]);

  useEffect(() => {
    localStorage.setItem('reborn_save_v99_final_v7', JSON.stringify(state));
    localStorage.setItem('reborn_theme', theme);
  }, [state, theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'day' ? 'night' : 'day');
    notify(theme === 'day' ? "🌙 切換至夜間修行模式" : "☀️ 切換至日間修行模式");
  };

  const triggerFinalBlessing = async () => {
    setIsLoadingImage(true);
    const text = await getFinalBlessing();
    setFinalBlessingText(text);
    setShowBlessing(true);
    setIsLoadingImage(false);
  };

  const gainExp = (amount: number) => {
    setState(prev => {
      if (prev.level >= 99) return prev;
      const newExp = prev.exp + amount;
      const newLevel = Math.min(99, Math.floor(newExp / 100) + 1);
      const newStats = { ...prev.stats, totalExp: prev.stats.totalExp + amount };
      
      if (newLevel > prev.level) {
        setIsLevelingUp(true);
        notify(`🌟 LEVEL UP! 貓貓邁向 LV.${newLevel}`);
        fetchCatImage(newLevel);
        if (newLevel === 99) {
          setTimeout(() => triggerFinalBlessing(), 2500);
        }
        setTimeout(() => setIsLevelingUp(false), 2000);
      }
      return { ...prev, exp: newExp, level: newLevel, stats: newStats };
    });
  };

  const handleMorningElixir = () => {
    if (state.tasks.morningElixir) return;
    setState(prev => ({ ...prev, mp: 100, tasks: { ...prev.tasks, morningElixir: true }, stats: { ...prev.stats, totalWaterDrunk: prev.stats.totalWaterDrunk + 1 } }));
    notify("💧 生命之水補滿意志力！");
    gainExp(20);
  };

  const handlePostMealPatrol = () => {
    if (state.tasks.postMealPatrol >= 3) return;
    setState(prev => ({ ...prev, hp: Math.min(100, prev.hp + 10), tasks: { ...prev.tasks, postMealPatrol: prev.tasks.postMealPatrol + 1 }, stats: { ...prev.stats, totalPatrols: prev.stats.totalPatrols + 1 } }));
    notify(`🐾 巡邏完成！HP+10`);
    gainExp(30);
  };

  const handleMindShieldSubmit = () => {
    if (winTexts.some(t => t.trim() === '')) return;
    setState(prev => ({ 
      ...prev, 
      mp: Math.min(100, prev.mp + 25), 
      shieldActive: true, 
      tasks: { ...prev.tasks, mindShield: true }, 
      wins: [...winTexts], 
      stats: { ...prev.stats, totalShields: prev.stats.totalShields + 1 } 
    }));
    setShowWinInput(false);
    notify("🛡️ 意志守護已啟動！");
    gainExp(50);
  };

  const onBattleEnd = (result: 'victory' | 'defeat', mpCost: number, hpCost: number, mpGain: number) => {
    setShowBattle(false);
    setState(prev => ({
      ...prev,
      hp: Math.max(0, prev.hp - hpCost),
      mp: Math.min(100, Math.max(0, prev.mp - mpCost + mpGain)),
      lastBattleResult: result,
      stats: result === 'victory' ? { ...prev.stats, totalBattlesWon: prev.stats.totalBattlesWon + 1 } : prev.stats
    }));
    if (result === 'victory') { gainExp(100); notify("⚔️ 戰勝宵夜惡魔！"); }
    else { notify("❌ 誘惑成功... 體態受損"); }
  };

  const getRecordSymbol = (record: DayRecord) => {
    if (record.battleResult === 'defeat') return 'X';
    if (record.tasksCompleted === 3) return 'O';
    return '△';
  };

  const getSymbolColor = (symbol: string) => {
    if (symbol === 'O') return 'text-emerald-500 bg-emerald-50';
    if (symbol === 'X') return 'text-red-500 bg-red-50';
    return 'text-orange-400 bg-orange-50';
  };

  const perfectDays = fullHistory.filter(h => h.tasksCompleted === 3).length;
  const totalDaysCount = fullHistory.length;
  const completionRate = totalDaysCount > 0 ? Math.round((perfectDays / totalDaysCount) * 100) : 0;

  // 主題樣式配置
  const themeClasses = {
    bg: theme === 'day' ? 'bg-[#fdfcf5]' : 'bg-[#0f172a]',
    text: theme === 'day' ? 'text-slate-700' : 'text-slate-200',
    card: theme === 'day' ? 'bg-white border-orange-50' : 'bg-slate-900/80 border-slate-800 backdrop-blur-xl',
    header: theme === 'day' ? 'bg-white/95 border-orange-50' : 'bg-slate-900/95 border-slate-800 backdrop-blur-xl',
    missionCard: theme === 'day' ? 'bg-white' : 'bg-slate-900 border-slate-800',
    subText: theme === 'day' ? 'text-slate-400' : 'text-slate-500',
  };

  return (
    <div className={`min-h-screen ${themeClasses.bg} ${themeClasses.text} font-sans transition-colors duration-700 selection:bg-orange-200`}>
      <div className="fixed inset-0 pointer-events-none z-[60]">
        {particles.map(p => (
          <div key={p.id} className="absolute w-4 h-4 text-yellow-400" style={{ left: p.x, top: p.y }}>
            {p.id % 2 === 0 ? '✨' : '🪙'}
          </div>
        ))}
      </div>

      <header className="fixed top-0 left-0 right-0 z-50 p-4 pointer-events-none">
        <div className="max-w-2xl mx-auto pointer-events-auto">
          <div className={`${themeClasses.header} rounded-[32px] overflow-hidden transition-all duration-500 shadow-xl border-4 ${isHudCollapsed ? 'p-4' : 'p-6 md:p-8'}`}>
            <div className="flex justify-between items-center mb-4">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className={`font-black text-orange-500 tracking-tighter transition-all ${isHudCollapsed ? 'text-sm' : 'text-xl'}`}>Project Reborn</h1>
                  <button onClick={() => { setSelectedRecord(null); setShowStats(true); }} className={`w-8 h-8 rounded-full ${theme === 'day' ? 'bg-orange-100 text-orange-600' : 'bg-slate-800 text-orange-400'} flex items-center justify-center text-[10px] hover:scale-110 transition-all shadow-sm`}>📊</button>
                </div>
                {!isHudCollapsed && <span className="text-[10px] text-orange-400 font-bold tracking-[0.1em] mt-1 uppercase">修行第 {totalDaysCount} 天</span>}
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[12px] font-black text-white px-5 py-2 rounded-full shadow-lg transition-all ${state.level >= 99 ? 'bg-gradient-to-r from-yellow-400 to-orange-500 animate-pulse' : 'bg-orange-500'}`}>
                   LV.{state.level}
                </span>
                <button onClick={() => setIsHudCollapsed(!isHudCollapsed)} className={`w-8 h-8 rounded-full ${theme === 'day' ? 'bg-orange-50 text-orange-400' : 'bg-slate-800 text-slate-500'} flex items-center justify-center text-xs hover:bg-orange-100 transition-colors border border-orange-100/10`}>{isHudCollapsed ? '▼' : '▲'}</button>
              </div>
            </div>

            <div className={`grid grid-cols-1 gap-4 transition-all duration-500 overflow-hidden ${isHudCollapsed ? 'max-h-0 opacity-0' : 'max-h-60 opacity-100 mt-4'}`}>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-black px-1 text-slate-400"><span>體態健康 (HP)</span><span className={state.hp < 40 ? 'text-red-500 animate-pulse' : 'text-emerald-500'}>{state.hp}/100</span></div>
                <div className="h-3.5 bg-slate-50/10 rounded-full overflow-hidden border border-slate-100/10 p-[2px]"><div className={`h-full rounded-full transition-all duration-1000 ${state.hp < 40 ? 'bg-gradient-to-r from-red-500 to-pink-400' : 'bg-emerald-400'}`} style={{ width: `${state.hp}%` }} /></div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-black px-1 text-blue-400"><span>意志能量 (MP)</span><span>{state.mp}/100</span></div>
                <div className="h-3.5 bg-slate-50/10 rounded-full overflow-hidden border border-slate-100/10 p-[2px]"><div className="h-full bg-blue-400 rounded-full transition-all duration-1000" style={{ width: `${state.mp}%` }} /></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className={`max-w-2xl mx-auto px-6 pb-20 transition-all duration-500 ${isHudCollapsed ? 'pt-28' : 'pt-[240px]'}`}>
        <Avatar 
          level={state.level} hp={state.hp} shieldActive={state.shieldActive} 
          isLevelingUp={isLevelingUp} imageUrl={catImageUrl} isLoadingImage={isLoadingImage}
          onPet={handlePetting} isPetting={isPetting} theme={theme}
        />

        <div className="space-y-5 mt-12">
          <h2 className="text-[11px] font-black text-orange-300 mb-4 tracking-[0.4em] uppercase ml-4">Daily Missions</h2>
          <button onClick={handleMorningElixir} disabled={state.tasks.morningElixir} className={`w-full p-7 rounded-[40px] flex items-center justify-between transition-all active:scale-[0.96] shadow-xl ${state.tasks.morningElixir ? 'opacity-30 grayscale pointer-events-none' : `${themeClasses.missionCard} border border-blue-50/10`}`}>
            <div className="flex items-center gap-6 text-left"><div className="w-16 h-16 bg-blue-50/10 rounded-3xl flex items-center justify-center text-4xl">🥣</div><div><div className="font-black text-xl text-blue-500">生命之水</div><div className={`text-xs font-bold ${themeClasses.subText}`}>晨起補水 | 回復 100% MP</div></div></div>
            {state.tasks.morningElixir && <span className="text-[10px] font-black bg-blue-500/20 text-blue-500 px-3 py-1 rounded-full">OK</span>}
          </button>
          <button onClick={handlePostMealPatrol} disabled={state.tasks.postMealPatrol >= 3} className={`w-full p-7 rounded-[40px] flex items-center justify-between transition-all active:scale-[0.96] shadow-xl ${state.tasks.postMealPatrol >= 3 ? 'opacity-30 grayscale pointer-events-none' : `${themeClasses.missionCard} border border-emerald-50/10`}`}>
            <div className="flex items-center gap-6 text-left"><div className="w-16 h-16 bg-emerald-50/10 rounded-3xl flex items-center justify-center text-4xl">🐾</div><div><div className="font-black text-xl text-emerald-500">飯後巡邏 ({state.tasks.postMealPatrol}/3)</div><div className={`text-xs font-bold ${themeClasses.subText}`}>餐後走動 15min | HP+10</div></div></div>
          </button>
          <button onClick={() => !state.tasks.mindShield && setShowWinInput(true)} disabled={state.tasks.mindShield} className={`w-full p-7 rounded-[40px] flex items-center justify-between transition-all active:scale-[0.96] shadow-xl ${state.tasks.mindShield ? 'opacity-30 grayscale pointer-events-none' : `${themeClasses.missionCard} border border-orange-50/10`}`}>
            <div className="flex items-center gap-6 text-left"><div className="w-16 h-16 bg-orange-50/10 rounded-3xl flex items-center justify-center text-4xl">🛡️</div><div><div className="font-black text-xl text-orange-500">心靈護盾</div><div className={`text-xs font-bold ${themeClasses.subText}`}>記錄成就 | 強化意志能量</div></div></div>
          </button>
        </div>

        <div className="mt-20 flex flex-col items-center gap-4 py-10 border-t border-orange-100/10">
          <div className={`flex p-1.5 rounded-full ${theme === 'day' ? 'bg-orange-50' : 'bg-slate-800'} transition-colors duration-500`}>
            <button 
              onClick={() => theme !== 'day' && toggleTheme()}
              className={`px-6 py-2.5 rounded-full flex items-center gap-2 transition-all ${theme === 'day' ? 'bg-white text-orange-600 shadow-md font-black scale-105' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <span className="text-lg">☀️</span>
              <span className="text-xs">日間模式</span>
            </button>
            <button 
              onClick={() => theme !== 'night' && toggleTheme()}
              className={`px-6 py-2.5 rounded-full flex items-center gap-2 transition-all ${theme === 'night' ? 'bg-slate-900 text-orange-400 shadow-md font-black scale-105' : 'text-slate-500 hover:text-slate-400'}`}
            >
              <span className="text-lg">🌙</span>
              <span className="text-xs">夜間模式</span>
            </button>
          </div>
        </div>
      </main>

      {showStats && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-orange-950/20 backdrop-blur-md">
          <div className={`${theme === 'day' ? 'bg-white border-orange-50' : 'bg-slate-900 border-slate-800'} rounded-[48px] w-full max-w-lg max-h-[85vh] shadow-2xl relative flex flex-col border-8 overflow-hidden transition-colors duration-500`}>
            <div className={`p-8 pb-4 flex justify-between items-center ${theme === 'day' ? 'bg-orange-50/30' : 'bg-slate-800/30'}`}>
              <div>
                <h3 className={`text-3xl font-black ${theme === 'day' ? 'text-slate-800' : 'text-white'}`}>修行時光機</h3>
                <p className="text-[10px] font-bold text-orange-400 mt-1 uppercase tracking-widest">達成率：{completionRate}% | 修行 {totalDaysCount} 天</p>
              </div>
              <button onClick={() => setShowStats(false)} className={`w-10 h-10 rounded-full flex items-center justify-center ${theme === 'day' ? 'bg-white text-slate-400' : 'bg-slate-800 text-slate-500'} shadow-md transition-all active:scale-90 hover:scale-110`}>✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 scrollbar-hide">
              {!selectedRecord ? (
                <>
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {['一','二','三','四','五','六','日'].map(d => (
                      <div key={d} className="text-center text-[10px] font-black text-slate-500 py-2">{d}</div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: calendarPadding }).map((_, i) => (
                      <div key={`pad-${i}`} className="aspect-square"></div>
                    ))}
                    
                    {fullHistory.map((record, idx) => {
                      const symbol = getRecordSymbol(record);
                      const isToday = record.date === state.lastUpdated;
                      const dateObj = new Date(record.date);
                      const dateStr = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;

                      return (
                        <div key={idx} className="flex flex-col items-center gap-1">
                          <button 
                            onClick={() => setSelectedRecord(record)} 
                            className={`w-full aspect-square rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-sm border-2 relative ${theme === 'day' ? '' : 'border-white/5'} ${getSymbolColor(symbol)}`}
                          >
                            <span className="font-black text-lg">{symbol}</span>
                            {isToday && <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white animate-pulse" />}
                          </button>
                          <span className={`text-[9px] font-black ${isToday ? 'text-orange-500' : 'text-slate-500 opacity-60'}`}>{dateStr}</span>
                        </div>
                      )
                    })}
                  </div>
                  {/* 時光機底部提示文字 */}
                  <div className="text-center py-6">
                    <p className="text-[12px] text-slate-400 font-black uppercase tracking-[0.2em] animate-pulse">深吸一口氣，你很棒！</p>
                  </div>
                </>
              ) : (
                <div className="p-1 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <button onClick={() => setSelectedRecord(null)} className="mb-6 flex items-center gap-2 text-orange-500 font-black text-sm hover:translate-x-[-4px] transition-transform">← 返回月曆</button>
                  <div className={`${theme === 'day' ? 'bg-white border-orange-100' : 'bg-slate-800 border-slate-700'} p-7 rounded-[32px] border-4 shadow-xl`}>
                    <div className="flex justify-between items-start mb-6">
                      <div className="space-y-1">
                        <div className={`text-2xl font-black tracking-tighter ${theme === 'day' ? 'text-slate-800' : 'text-white'}`}>{selectedRecord.date === state.lastUpdated ? '今天' : new Date(selectedRecord.date).toLocaleDateString('zh-TW', { month: 'long', day: 'numeric' })}</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">修行第 {fullHistory.indexOf(selectedRecord) + 1} 天</div>
                      </div>
                      <div className={`px-4 py-1.5 rounded-full text-[10px] font-black shadow-sm ${getSymbolColor(getRecordSymbol(selectedRecord))}`}>{getRecordSymbol(selectedRecord) === 'O' ? '完美的一天' : '紮實修行中'}</div>
                    </div>
                    <div className="space-y-5">
                      {selectedRecord.wins && selectedRecord.wins.length > 0 ? (
                        <div className="space-y-3">
                          {selectedRecord.wins.map((w, i) => (
                            <div key={i} className={`flex gap-4 p-4 ${theme === 'day' ? 'bg-orange-50/30' : 'bg-slate-900/50'} rounded-2xl border ${theme === 'day' ? 'border-orange-50' : 'border-slate-700'} items-start`}>
                              <span className="text-lg animate-bounce">✨</span>
                              <span className={`text-sm font-bold leading-relaxed ${theme === 'day' ? 'text-slate-700' : 'text-slate-300'}`}>{w}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center py-10 text-slate-500 italic text-sm">這天貓貓專注於行動，忘了記錄護盾內容喵...</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-10 right-8 flex flex-col items-end gap-3 z-50">
        <div className="bg-red-600 text-white text-[10px] font-black px-4 py-2 rounded-xl shadow-lg animate-pulse tracking-[0.2em]">敵襲！</div>
        <button onClick={() => setShowBattle(true)} className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center shadow-xl border-4 border-white group transition-all active:scale-90 hover:scale-105"><span className="text-5xl group-hover:scale-125 transition-transform">⚔️</span></button>
      </div>

      {notif && (
        <div className="fixed top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-[200] w-[85%] max-w-sm">
          <div className={`${theme === 'day' ? 'bg-white border-orange-400' : 'bg-slate-900 border-orange-500'} border-4 text-orange-500 px-8 py-6 rounded-[32px] font-black shadow-2xl animate-in zoom-in-95 duration-300 text-center relative`}>
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-4xl">🐱</div>
            {notif}
          </div>
        </div>
      )}

      {showWinInput && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-8 bg-black/40 backdrop-blur-xl">
          <div className={`${theme === 'day' ? 'bg-white' : 'bg-slate-900'} border-4 border-orange-100 rounded-[50px] p-10 w-full max-w-lg shadow-2xl transition-colors duration-500`}>
            <h3 className="text-3xl font-black text-orange-500 mb-8 text-center">今日三件成就</h3>
            <div className="space-y-4 mb-10">
              {winTexts.map((text, i) => (
                <input key={i} className={`w-full ${theme === 'day' ? 'bg-orange-50/50 text-slate-900' : 'bg-slate-800/50 text-white'} border-b-4 border-orange-200 p-5 focus:outline-none focus:border-orange-500 transition-all rounded-t-3xl font-black text-lg`} placeholder={`成就 #${i + 1}`} value={text} onChange={e => { const newWins = [...winTexts]; newWins[i] = e.target.value; setWinTexts(newWins); }} />
              ))}
            </div>
            <div className="flex gap-4">
              <button onClick={() => setShowWinInput(false)} className="flex-1 py-5 text-slate-500 font-black text-lg">取消</button>
              <button onClick={handleMindShieldSubmit} disabled={winTexts.some(t => t.trim().length === 0)} className="flex-1 bg-orange-500 text-white font-black py-5 rounded-[25px] shadow-lg disabled:opacity-20 transition-all text-lg">注入靈氣</button>
            </div>
          </div>
        </div>
      )}

      {showBattle && <BattleSystem level={state.level} currentMp={state.mp} onClose={onBattleEnd} />}
    </div>
  );
};

export default App;
