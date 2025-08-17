export type Rank = 'Mini' | 'Core' | 'Plus' | 'Pro' | 'ProMax';

export type Category = 'Builder' | 'Social' | 'Degen' | 'Player';

export interface UserScore {
  fid: number;
  username: string;
  avatar: string;
  totalScore: number;
  categories: {
    [K in Category]: {
      score: number;
      rank: Rank;
      level: number;
      progress: number;
    };
  };
  primaryCategory: Category;
  badges: Badge[];
  season: number;
  lastUpdated: string;
  // Nuevos campos para evolución y ranking
  evolution: EvolutionData[];
  rankings: {
    global: number;
    categories: {
      [K in Category]: number;
    };
  };
  totalUsers: number; // Para calcular percentiles
}

export interface EvolutionData {
  date: string;
  totalScore: number;
  categoryScores: {
    [K in Category]: number;
  };
  rank: Rank;
  primaryCategory: Category;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  category: Category;
  rank: Rank;
  earnedAt: string;
  imageUrl: string;
}

export interface Action {
  id: string;
  type: string;
  category: Category;
  points: number;
  description: string;
  cooldown: 'daily' | 'weekly' | 'none';
  lastPerformed?: string;
}

export interface Season {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  theme: string;
}

export interface LeaderboardEntry {
  fid: number;
  username: string;
  avatar: string;
  score: number;
  rank: Rank;
  position: number;
  change: number; // Cambio de posición (+/-) desde la semana pasada
}
