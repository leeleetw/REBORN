
import React, { useState, useEffect } from 'react';
import { EnemyType, BattleState } from '../types';
import { getMotivationalQuote } from '../services/geminiService';

interface BattleSystemProps {
  onClose: (result: 'victory' | 'defeat', mpCost: number, hpCost: number, mpGain: number) => void;
  level: number;
  currentMp: number;
}

const BattleSystem: React.FC<BattleSystemProps> = ({ onClose, level, currentMp }) => {
  const [battle, setBattle] = useState<BattleState>({
    isActive: true,
    enemyType: Math.random() > 0.5 ? EnemyType.ANXIETY_SLIME : EnemyType.BOREDOM_DEMON,
    enemyHp: 100,
    battleLog: ['大魔王「深夜食堂的誘惑」出現在前方！'],
  });
  const [loading, setLoading] = useState(false);
  const [totalMpCost, setTotalMpCost] = useState(0);
  const [totalMpGain, setTotalMpGain] = useState(0);
  const [sessionMp, setSessionMp] = useState(currentMp);

  const addLog = (msg: string) => {
    setBattle(prev => ({
      ...prev,
      battleLog: [msg, ...prev.battleLog].slice(0, 5)
    }));
  };

  const handleDrinkWater = () => {
    const damage = 25;
    setBattle(prev => ({ ...prev, enemyHp: Math.max(0, prev.enemyHp - damage) }));
    addLog(`💧 喝水防禦！灌入 300cc，意志力稍微穩定。造成 ${damage} 傷害。`);
  };

  const handleHotShower = () => {
    if (sessionMp < 10) {
      addLog("❌ MP 不足！貓貓現在不想洗澡...");
      return;
    }
    const damage = 55;
    setSessionMp(s => s - 10);
    setTotalMpCost(c => c + 10);
    setBattle(prev => ({ ...prev, enemyHp: Math.max(0, prev.enemyHp - damage) }));
    addLog(`🚿 熱水澡必殺技！高溫蒸發了食慾，造成 ${damage} 爆擊！`);
  };

  const handleMeditationAttack = async () => {
    if (sessionMp < 20) {
      addLog("❌ MP 不足！精神無法集中喵...");
      return;
    }
    setLoading(true);
    addLog("🌀 進入深度冥想... 正在抽取靈氣能量...");
    
    // 透過 API 獲取強大的精神語錄
    const quote = await getMotivationalQuote(level, 'attack');
    
    setLoading(false);
    setSessionMp(s => s - 20);
    setTotalMpCost(c => c + 20);
    setBattle(prev => ({ ...prev, enemyHp: Math.max(0, prev.enemyHp - 85) }));
    addLog(`✨ 精神震懾：『${quote}』`);
    addLog(`💥 精神力大爆發！瞬間摧毀敵人 85 點意志防線！`);
  };

  const handleCallBackup = async () => {
    setLoading(true);
    addLog("📢 發送信號... 呼叫未來的漂亮貓貓支援...");
    
    const quote = await getMotivationalQuote(level, 'backup');
    
    setLoading(false);
    const gain = 35;
    setSessionMp(s => Math.min(100, s + gain));
    setTotalMpGain(g => g + gain);
    addLog(`🫂 援軍抵達！導師說：『${quote}』`);
    addLog(`🌟 獲得了心理慰藉，MP 回復 ${gain}！`);
  };

  useEffect(() => {
    if (battle.enemyHp <= 0) {
      setTimeout(() => onClose('victory', totalMpCost, 0, totalMpGain), 1500);
    }
  }, [battle.enemyHp, onClose, totalMpCost, totalMpGain]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl">
      <div className="max-w-md w-full bg-slate-900 border-[3px] border-red-500/50 p-6 rounded-[40px] shadow-[0_0_60px_rgba(220,38,38,0.3)] relative overflow-hidden">
        
        {/* 背景裝飾 */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-red-600/10 rounded-full blur-3xl"></div>
        
        {/* Enemy UI */}
        <div className="flex flex-col items-center mb-6 relative">
          <div className="px-4 py-1 bg-red-600 text-[10px] font-black rounded-full mb-6 tracking-[0.2em] uppercase">Danger Level: High</div>
          <div className="w-32 h-32 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 border border-slate-700 shadow-inner group">
            <span className="text-7xl group-hover:scale-110 transition-transform duration-500 drop-shadow-xl">
              {battle.enemyType === EnemyType.ANXIETY_SLIME ? '🍕' : '🍰'}
            </span>
          </div>
          <div className="w-full px-4 mb-2">
            <div className="flex justify-between text-[10px] font-bold text-red-400 mb-1">
              <span>敵人誘惑力</span>
              <span>{battle.enemyHp}%</span>
            </div>
            <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-700" style={{ width: `${battle.enemyHp}%` }} />
            </div>
          </div>
        </div>

        {/* Player Stats during Battle */}
        <div className="px-4 mb-6">
          <div className="flex justify-between text-[10px] mb-1 text-blue-400 font-black">
            <span>意志力 (MP)</span>
            <span>{sessionMp}/100</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div className="h-full bg-blue-500 transition-all" style={{ width: `${sessionMp}%` }} />
          </div>
        </div>

        {/* Battle Log Box */}
        <div className="bg-black/60 p-4 rounded-3xl mb-6 h-32 overflow-y-auto border border-slate-800/50 text-xs font-bold leading-relaxed shadow-inner">
          {battle.battleLog.map((log, i) => (
            <div key={i} className={i === 0 ? "text-yellow-400" : "text-slate-500"}>
              {i === 0 ? "▸ " : ""}{log}
            </div>
          ))}
          {loading && <div className="text-blue-400 animate-pulse mt-1 font-black">精神力感應中... 蓄力中...</div>}
        </div>

        {/* Battle Controls */}
        <div className="grid grid-cols-2 gap-3 px-2">
          <button 
            disabled={loading}
            onClick={handleDrinkWater}
            className="py-4 bg-slate-800 hover:bg-blue-900 border border-slate-700 rounded-2xl text-xs font-black transition-all active:scale-95"
          >
            💧 喝水 (0 MP)
          </button>
          <button 
            disabled={loading || sessionMp < 10}
            onClick={handleHotShower}
            className="py-4 bg-slate-800 hover:bg-emerald-900 border border-slate-700 rounded-2xl text-xs font-black transition-all active:scale-95 disabled:opacity-20"
          >
            🚿 洗澡 (10 MP)
          </button>
          <button 
            disabled={loading || sessionMp < 20}
            onClick={handleMeditationAttack}
            className="col-span-2 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl text-sm font-black shadow-lg shadow-indigo-900/40 transition-all active:scale-95 disabled:opacity-30"
          >
            🧘 冥想精神攻擊 (20 MP)
          </button>
          <button 
            disabled={loading}
            onClick={handleCallBackup}
            className="col-span-2 py-4 bg-orange-500 hover:bg-orange-400 text-black rounded-2xl text-sm font-black shadow-lg shadow-orange-900/20 transition-all active:scale-95"
          >
            📢 呼叫援軍 (+MP)
          </button>
        </div>

        <button 
          onClick={() => onClose('defeat', totalMpCost, 50, totalMpGain)}
          className="w-full mt-6 text-[10px] text-slate-500 hover:text-red-400 font-bold transition-colors uppercase tracking-widest"
        >
          [ 放棄抵抗...我還是想吃 ]
        </button>
      </div>
    </div>
  );
};

export default BattleSystem;
