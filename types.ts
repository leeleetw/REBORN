
export interface DayRecord {
  date: string;
  tasksCompleted: number; // 0-3
  battleResult: 'none' | 'victory' | 'defeat';
  wins: string[]; // 儲存當天的 3 個微小勝利
}

export interface GameState {
  level: number;
  exp: number;
  hp: number;
  mp: number;
  shieldActive: boolean;
  streak: number;
  lastUpdated: string;
  tasks: DailyTasks;
  wins: string[]; // 當日的暫存
  stats: GameStats;
  history: DayRecord[]; 
}

export interface GameStats {
  totalExp: number;
  totalBattlesWon: number;
  totalWaterDrunk: number;
  totalPatrols: number;
  totalShields: number;
  startDate: string;
}

export interface DailyTasks {
  morningElixir: boolean;
  postMealPatrol: number; 
  mindShield: boolean;
}

export enum EnemyType {
  ANXIETY_SLIME = '焦慮史萊姆',
  BOREDOM_DEMON = '無聊惡魔',
}

export interface BattleState {
  isActive: boolean;
  enemyType: EnemyType;
  enemyHp: number;
  battleLog: string[];
}
