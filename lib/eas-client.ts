// Simulación del cliente EAS para desarrollo
// TODO: Reemplazar con implementación real de EAS cuando esté listo para producción


const EAS_CONTRACT_ADDRESS = '0x4200000000000000000000000000000000000021';


export const NOTCH_SCHEMAS = {
  USER_SCORE: '0x1234567890123456789012345678901234567890123456789012345678901234', 
  TASK_COMPLETION: '0x2345678901234567890123456789012345678901234567890123456789012345', 
  BADGE_EARNED: '0x3456789012345678901234567890123456789012345678901234567890123456', 
  ACTIVITY_LOG: '0x4567890123456789012345678901234567890123456789012345678901234567', 
  SEASON_DATA: '0x5678901234567890123456789012345678901234567890123456789012345678', 
};

// Tipos de datos para las attestations
export interface UserScoreData {
  fid: number;
  totalScore: number;
  categoryScores: {
    Builder: number;
    Social: number;
    Degen: number;
    Player: number;
  };
  rank: string;
  level: number;
  season: number;
  lastUpdated: string;
}

export interface TaskCompletionData {
  fid: number;
  taskId: string;
  category: string;
  points: number;
  completedAt: string;
  verificationData: string; 
}

export interface BadgeEarnedData {
  fid: number;
  badgeId: string;
  badgeName: string;
  category: string;
  rank: string;
  earnedAt: string;
}

export interface ActivityLogData {
  fid: number;
  activityType: string;
  category: string;
  points: number;
  timestamp: string;
  metadata: string; 
}

export interface SeasonData {
  seasonId: number;
  seasonName: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  theme: string;
}

interface WalletClient {
  account: {
    address: string;
  };
  chain: {
    id: number;
  };
}

class EASClient {
  private mockUsers: Map<number, UserScoreData> = new Map();
  private mockTasks: Map<string, TaskCompletionData[]> = new Map();
  private mockBadges: Map<number, BadgeEarnedData[]> = new Map();
  private mockActivities: Map<number, ActivityLogData[]> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    const mockUser: UserScoreData = {
      fid: 12345,
      totalScore: 250,
      categoryScores: {
        Builder: 100,
        Social: 75,
        Degen: 50,
        Player: 25,
      },
      rank: 'Core',
      level: 3,
      season: 1,
      lastUpdated: new Date().toISOString(),
    };
    
    this.mockUsers.set(12345, mockUser);
    
    const mockBadges: BadgeEarnedData[] = [
      {
        fid: 12345,
        badgeId: 'first-cast',
        badgeName: 'First Cast',
        category: 'Social',
        rank: 'Core',
        earnedAt: new Date().toISOString(),
      }
    ];
    
    this.mockBadges.set(12345, mockBadges);
    
    const mockActivities: ActivityLogData[] = [
      {
        fid: 12345,
        activityType: 'cast_published',
        category: 'Social',
        points: 10,
        timestamp: new Date().toISOString(),
        metadata: JSON.stringify({ castId: '123', content: 'Hello Notch!' }),
      }
    ];
    
    this.mockActivities.set(12345, mockActivities);
  }

  async registerSchemas() {
    console.log('Mock: Schemas registrados');
    return true;
  }

  async saveUserScore(data: UserScoreData, signer: WalletClient) {
    try {
      this.mockUsers.set(data.fid, data);
      console.log('Mock: User score guardado para FID:', data.fid);
      return { hash: '0x123...' };
    } catch (error) {
      console.error('Error guardando user score:', error);
      throw error;
    }
  }

  async saveTaskCompletion(data: TaskCompletionData, signer: WalletClient) {
    try {
      const key = `${data.fid}-${data.taskId}`;
      const existing = this.mockTasks.get(key) || [];
      existing.push(data);
      this.mockTasks.set(key, existing);
      
      console.log('Mock: Task completion guardado:', data.taskId);
      return { hash: '0x456...' };
    } catch (error) {
      console.error('Error guardando task completion:', error);
      throw error;
    }
  }

  async saveBadgeEarned(data: BadgeEarnedData, signer: WalletClient) {
    try {
      const existing = this.mockBadges.get(data.fid) || [];
      existing.push(data);
      this.mockBadges.set(data.fid, existing);
      
      console.log('Mock: Badge earned guardado:', data.badgeId);
      return { hash: '0x789...' };
    } catch (error) {
      console.error('Error guardando badge earned:', error);
      throw error;
    }
  }

  async saveActivityLog(data: ActivityLogData, signer: WalletClient) {
    try {
      const existing = this.mockActivities.get(data.fid) || [];
      existing.push(data);
      this.mockActivities.set(data.fid, existing);
      
      console.log('Mock: Activity log guardado:', data.activityType);
      return { hash: '0xabc...' };
    } catch (error) {
      console.error('Error guardando activity log:', error);
      throw error;
    }
  }

  async getUserScore(fid: number): Promise<UserScoreData | null> {
    try {
      return this.mockUsers.get(fid) || null;
    } catch (error) {
      console.error('Error obteniendo user score:', error);
      return null;
    }
  }

  async getUserTaskCompletions(fid: number): Promise<TaskCompletionData[]> {
    try {
      const allTasks: TaskCompletionData[] = [];
      this.mockTasks.forEach((tasks, key) => {
        if (key.startsWith(`${fid}-`)) {
          allTasks.push(...tasks);
        }
      });
      return allTasks;
    } catch (error) {
      console.error('Error obteniendo task completions:', error);
      return [];
    }
  }

  async getUserBadges(fid: number): Promise<BadgeEarnedData[]> {
    try {
      return this.mockBadges.get(fid) || [];
    } catch (error) {
      console.error('Error obteniendo badges:', error);
      return [];
    }
  }

  async getUserActivityLog(fid: number, limit: number = 50): Promise<ActivityLogData[]> {
    try {
      const activities = this.mockActivities.get(fid) || [];
      return activities.slice(-limit); // Obtener las más recientes
    } catch (error) {
      console.error('Error obteniendo activity log:', error);
      return [];
    }
  }

  async getGlobalLeaderboard(limit: number = 100): Promise<UserScoreData[]> {
    try {
      const allUsers = Array.from(this.mockUsers.values());
      return allUsers
        .sort((a: UserScoreData, b: UserScoreData) => b.totalScore - a.totalScore)
        .slice(0, limit);
    } catch (error) {
      console.error('Error obteniendo leaderboard:', error);
      return [];
    }
  }

  async getCategoryLeaderboard(category: string, limit: number = 100): Promise<UserScoreData[]> {
    try {
      const allUsers = Array.from(this.mockUsers.values());
      return allUsers
        .sort((a: UserScoreData, b: UserScoreData) => 
          b.categoryScores[category as keyof typeof b.categoryScores] - 
          a.categoryScores[category as keyof typeof a.categoryScores]
        )
        .slice(0, limit);
    } catch (error) {
      console.error('Error obteniendo category leaderboard:', error);
      return [];
    }
  }
}

export const easClient = new EASClient();