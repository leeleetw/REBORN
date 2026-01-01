
import React from 'react';

interface AvatarProps {
  level: number;
  hp: number;
  shieldActive: boolean;
  isLevelingUp: boolean;
  imageUrl: string | null;
  isLoadingImage: boolean;
  onPet: (e: React.MouseEvent) => void;
  isPetting: boolean;
  theme?: 'day' | 'night';
}

const Avatar: React.FC<AvatarProps> = ({ 
  level, 
  hp, 
  shieldActive, 
  isLevelingUp, 
  imageUrl, 
  isLoadingImage,
  onPet,
  isPetting,
  theme = 'day'
}) => {
  const isTired = hp < 40;
  const isEvolved = level >= 5;
  const isLegendary = level >= 10;

  // 根據主題調整文字顏色與光暈
  const textColorClass = theme === 'day' 
    ? 'text-slate-800' 
    : 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]';

  return (
    <div className={`relative flex flex-col items-center transition-all duration-700 ${isLevelingUp ? 'scale-110' : 'scale-100'}`}>
      {/* 升級特效 */}
      {isLevelingUp && (
        <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center">
          <div className="w-80 h-80 bg-orange-300 opacity-20 rounded-full blur-[60px] animate-ping"></div>
          <div className="absolute -top-16 text-8xl animate-bounce">✨</div>
        </div>
      )}
      
      {/* 靈氣護盾 */}
      {shieldActive && (
        <div className="absolute inset-[-40px] border-4 border-dotted border-orange-200 rounded-full animate-[spin_20s_linear_infinite] opacity-60" />
      )}

      {/* 貓咪顯示區 */}
      <div className={`relative w-80 h-80 rounded-[64px] overflow-hidden bg-white border-8 transition-all duration-500 shadow-2xl flex items-center justify-center ${
        isPetting 
          ? 'border-orange-400 shadow-[0_0_60px_rgba(251,146,60,0.5)] scale-[1.03]' 
          : isTired 
            ? 'border-red-100 grayscale-[20%]' 
            : 'border-orange-50 shadow-orange-50'
      }`}>
        {isLoadingImage ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-[10px] font-black text-orange-400 animate-pulse uppercase tracking-[0.2em]">Growing Neko...</div>
          </div>
        ) : imageUrl ? (
          <img 
            src={imageUrl} 
            alt="My Neko" 
            className={`w-full h-full object-cover transition-transform duration-500 ${isPetting ? 'scale-105' : 'scale-100'}`}
          />
        ) : (
          <div className="text-7xl animate-bounce">🐈</div>
        )}

        {/* 狀態遮罩 */}
        {isTired && <div className="absolute inset-0 bg-red-500/10 pointer-events-none animate-pulse" />}

        {/* 解壓摸摸鈕 (可愛貓爪) */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onPet(e);
          }}
          className="absolute bottom-6 right-6 w-20 h-20 bg-white shadow-xl rounded-full flex items-center justify-center border-4 border-orange-50 transition-all active:scale-90 group z-10 hover:shadow-orange-100"
        >
          <svg viewBox="0 0 100 100" className="w-12 h-12 fill-orange-400 group-hover:scale-110 transition-transform">
            <circle cx="50" cy="65" r="20" />
            <circle cx="25" cy="40" r="10" />
            <circle cx="42" cy="30" r="10" />
            <circle cx="58" cy="30" r="10" />
            <circle cx="75" cy="40" r="10" />
          </svg>
          {isPetting && (
            <div className="absolute inset-0 rounded-full border-4 border-orange-400 animate-ping opacity-60"></div>
          )}
        </button>
      </div>

      {/* 角色資訊 */}
      <div className="mt-12 text-center space-y-3 px-6">
        <div className="flex items-center justify-center gap-2">
          <span className="text-orange-500 font-black text-xs tracking-wide bg-orange-100 px-4 py-1.5 rounded-full shadow-sm">
            {isLegendary ? '🐈 傳奇神貓' : isEvolved ? '💪 健力萌橘' : '🥟 圓滾大福'}
          </span>
        </div>
        <h1 className={`text-4xl font-[900] tracking-tight ${textColorClass}`}>
          {isLegendary ? '聖域靈氣貓' : isEvolved ? '進化中的小橘' : '努力修行中的胖橘'}
        </h1>
        {isTired && (
          <div className="px-5 py-2.5 bg-red-50 text-red-500 rounded-3xl text-[11px] font-black animate-pulse mt-5 border-2 border-red-100">
            貓貓看起來有點累了，補充一下吧喵！
          </div>
        )}
      </div>
    </div>
  );
};

export default Avatar;
