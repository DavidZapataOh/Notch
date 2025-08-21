import { Category, Rank } from './types';
import { easClient, UserScoreData, TaskCompletionData, BadgeEarnedData, ActivityLogData } from './eas-client';
import { calculateRank, calculateProgress } from './scoring';

// Tipos específicos para reemplazar 'any'
interface WalletClient {
  account: {
    address: string;
  };
  chain: {
    id: number;
  };
}

interface VerificationData {
  [key: string]: unknown;
}

interface ActivityMetadata {
  [key: string]: unknown;
}

interface VerificationConfig {
  network?: string;
  farcaster?: boolean;
  keywords?: string[];
  [key: string]: unknown;
}

interface LeaderboardResult {
  global: UserScoreData[];
  categories: Record<Category, UserScoreData[]>;
}

// Configuración de badges dinámicos
export const BADGES = {
  // Badges por categoría
  Builder: {
    'first-deploy': {
      id: 'first-deploy',
      name: 'First Deploy',
      description: 'Deploy your first smart contract',
      category: 'Builder' as Category,
      rank: 'Core' as Rank,
      requirement: { type: 'deploy_count', value: 1 },
      imageUrl: '/badges/builder-first-deploy.png'
    },
    'code-contributor': {
      id: 'code-contributor',
      name: 'Code Contributor',
      description: 'Contribute to 5 different projects',
      category: 'Builder' as Category,
      rank: 'Plus' as Rank,
      requirement: { type: 'contribute_count', value: 5 },
      imageUrl: '/badges/builder-contributor.png'
    },
    'senior-builder': {
      id: 'senior-builder',
      name: 'Senior Builder',
      description: 'Deploy 10 smart contracts',
      category: 'Builder' as Category,
      rank: 'Pro' as Rank,
      requirement: { type: 'deploy_count', value: 10 },
      imageUrl: '/badges/builder-senior.png'
    }
  },
  Social: {
    'first-cast': {
      id: 'first-cast',
      name: 'First Cast',
      description: 'Publish your first cast',
      category: 'Social' as Category,
      rank: 'Core' as Rank,
      requirement: { type: 'cast_count', value: 1 },
      imageUrl: '/badges/social-first-cast.png'
    },
    'community-builder': {
      id: 'community-builder',
      name: 'Community Builder',
      description: 'Publish 50 casts',
      category: 'Social' as Category,
      rank: 'Plus' as Rank,
      requirement: { type: 'cast_count', value: 50 },
      imageUrl: '/badges/social-community.png'
    },
    'influencer': {
      id: 'influencer',
      name: 'Influencer',
      description: 'Publish 200 casts',
      category: 'Social' as Category,
      rank: 'Pro' as Rank,
      requirement: { type: 'cast_count', value: 200 },
      imageUrl: '/badges/social-influencer.png'
    }
  },
  Degen: {
    'first-swap': {
      id: 'first-swap',
      name: 'First Swap',
      description: 'Execute your first token swap',
      category: 'Degen' as Category,
      rank: 'Core' as Rank,
      requirement: { type: 'swap_count', value: 1 },
      imageUrl: '/badges/degen-first-swap.png'
    },
    'active-trader': {
      id: 'active-trader',
      name: 'Active Trader',
      description: 'Execute 25 swaps',
      category: 'Degen' as Category,
      rank: 'Plus' as Rank,
      requirement: { type: 'swap_count', value: 25 },
      imageUrl: '/badges/degen-trader.png'
    },
    'whale': {
      id: 'whale',
      name: 'Whale',
      description: 'Execute 100 swaps',
      category: 'Degen' as Category,
      rank: 'Pro' as Rank,
      requirement: { type: 'swap_count', value: 100 },
      imageUrl: '/badges/degen-whale.png'
    }
  },
  Player: {
    'first-quest': {
      id: 'first-quest',
      name: 'First Quest',
      description: 'Complete your first quest',
      category: 'Player' as Category,
      rank: 'Core' as Rank,
      requirement: { type: 'quest_count', value: 1 },
      imageUrl: '/badges/player-first-quest.png'
    },
    'quest-master': {
      id: 'quest-master',
      name: 'Quest Master',
      description: 'Complete 20 quests',
      category: 'Player' as Category,
      rank: 'Plus' as Rank,
      requirement: { type: 'quest_count', value: 20 },
      imageUrl: '/badges/player-master.png'
    },
    'legendary-player': {
      id: 'legendary-player',
      name: 'Legendary Player',
      description: 'Complete 100 quests',
      category: 'Player' as Category,
      rank: 'Pro' as Rank,
      requirement: { type: 'quest_count', value: 100 },
      imageUrl: '/badges/player-legendary.png'
    }
  }
};

// Tareas dinámicas que se pueden configurar
export const DYNAMIC_TASKS = {
  // Tareas diarias
  daily: [
    {
      id: 'daily-cast-notch',
      title: 'Share about Notch',
      description: 'Post a cast mentioning @notch or #notch',
      category: 'Social' as Category,
      points: 25,
      verificationMethod: 'farcaster_api',
      verificationConfig: {
        keywords: ['notch', '@notch', '#notch'],
        minLength: 10
      }
    },
    {
      id: 'daily-swap',
      title: 'Make a Swap',
      description: 'Execute any token swap on Base network',
      category: 'Degen' as Category,
      points: 15,
      verificationMethod: 'onchain',
      verificationConfig: {
        network: 'base',
        eventType: 'token_swap',
        minValue: 0.001
      }
    }
  ],
  // Tareas semanales
  weekly: [
    {
      id: 'weekly-deploy',
      title: 'Deploy on Base',
      description: 'Deploy any smart contract on Base network',
      category: 'Builder' as Category,
      points: 100,
      verificationMethod: 'onchain',
      verificationConfig: {
        network: 'base',
        eventType: 'contract_creation'
      }
    },
    {
      id: 'weekly-partner-app',
      title: 'Try Partner App',
      description: 'Use any partner miniapp and complete an action',
      category: 'Player' as Category,
      points: 30,
      verificationMethod: 'eas_attestation',
      verificationConfig: {
        schemaIds: ['0x...'], // Schema IDs de partners
        minAttestations: 1
      }
    }
  ],
  // Tareas especiales
  special: [
    {
      id: 'invite-friends',
      title: 'Invite Friends',
      description: 'Invite 3 friends to Notch',
      category: 'Player' as Category,
      points: 50,
      verificationMethod: 'referral',
      verificationConfig: {
        minReferrals: 3
      }
    }
  ]
};

class ScoringEngine {
  private currentSeason = 1;

  // Obtener score actual del usuario
  async getUserScore(fid: number): Promise<UserScoreData | null> {
    return await easClient.getUserScore(fid);
  }

  // Crear score inicial para un usuario nuevo
  async initializeUserScore(fid: number, signer: WalletClient): Promise<UserScoreData> {
    const initialScore: UserScoreData = {
      fid,
      totalScore: 0,
      categoryScores: {
        Builder: 0,
        Social: 0,
        Degen: 0,
        Player: 0
      },
      rank: 'Mini',
      level: 1,
      season: this.currentSeason,
      lastUpdated: new Date().toISOString()
    };

    await easClient.saveUserScore(initialScore, signer);
    return initialScore;
  }

  // Añadir puntos por actividad
  async addPoints(
    fid: number, 
    category: Category, 
    points: number, 
    activityType: string, 
    metadata: ActivityMetadata, 
    signer: WalletClient
  ): Promise<UserScoreData> {
    // Obtener score actual
    let currentScore = await this.getUserScore(fid);
    
    if (!currentScore) {
      currentScore = await this.initializeUserScore(fid, signer);
    }

    // Actualizar scores
    const newCategoryScore = currentScore.categoryScores[category] + points;
    const newTotalScore = currentScore.totalScore + points;

    // Calcular nuevo rank y level
    const newRank = calculateRank(newTotalScore);
    const newLevel = Math.floor(newTotalScore / 100) + 1;

    // Crear nuevo score
    const updatedScore: UserScoreData = {
      ...currentScore,
      totalScore: newTotalScore,
      categoryScores: {
        ...currentScore.categoryScores,
        [category]: newCategoryScore
      },
      rank: newRank,
      level: newLevel,
      lastUpdated: new Date().toISOString()
    };

    // Guardar en EAS
    await easClient.saveUserScore(updatedScore, signer);

    // Guardar log de actividad
    const activityLog: ActivityLogData = {
      fid,
      activityType,
      category,
      points,
      timestamp: new Date().toISOString(),
      metadata: JSON.stringify(metadata)
    };

    await easClient.saveActivityLog(activityLog, signer);

    // Verificar si se ganó algún badge
    await this.checkAndAwardBadges(fid, category, updatedScore, signer);

    return updatedScore;
  }

  // Completar una tarea
  async completeTask(
    fid: number,
    taskId: string,
    category: Category,
    points: number,
    verificationData: VerificationData,
    signer: WalletClient
  ): Promise<boolean> {
    try {

      const completedTasks = await easClient.getUserTaskCompletions(fid);
      const alreadyCompleted = completedTasks.some(task => task.taskId === taskId);
      
      if (alreadyCompleted) {
        console.log(`Task ${taskId} already completed by user ${fid}`);
        return false;
      }

      const taskCompletion: TaskCompletionData = {
        fid,
        taskId,
        category,
        points,
        completedAt: new Date().toISOString(),
        verificationData: JSON.stringify(verificationData)
      };

      await easClient.saveTaskCompletion(taskCompletion, signer);


      await this.addPoints(fid, category, points, 'task_completion', {
        taskId,
        verificationData
      }, signer);

      return true;
    } catch (error) {
      console.error('Error completing task:', error);
      return false;
    }
  }

  
  async checkAndAwardBadges(
    fid: number, 
    category: Category, 
    currentScore: UserScoreData, 
    signer: WalletClient
  ): Promise<void> {
    try {
      const categoryBadges = BADGES[category];
      const userBadges = await easClient.getUserBadges(fid);
      const userActivities = await easClient.getUserActivityLog(fid, 1000);

      const activityCounts = userActivities.reduce((acc, activity) => {
        if (activity.category === category) {
          acc[activity.activityType] = (acc[activity.activityType] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      for (const [badgeId, badge] of Object.entries(categoryBadges)) {

        const hasBadge = userBadges.some(userBadge => userBadge.badgeId === badgeId);
        if (hasBadge) continue;

        const requirement = badge.requirement;
        let meetsRequirement = false;

        switch (requirement.type) {
          case 'deploy_count':
            meetsRequirement = (activityCounts['deploy'] || 0) >= requirement.value;
            break;
          case 'contribute_count':
            meetsRequirement = (activityCounts['contribute'] || 0) >= requirement.value;
            break;
          case 'cast_count':
            meetsRequirement = (activityCounts['publish'] || 0) >= requirement.value;
            break;
          case 'swap_count':
            meetsRequirement = (activityCounts['swap'] || 0) >= requirement.value;
            break;
          case 'quest_count':
            const completedTasks = await easClient.getUserTaskCompletions(fid);
            meetsRequirement = completedTasks.length >= requirement.value;
            break;
        }

        if (meetsRequirement) {

          const badgeData: BadgeEarnedData = {
            fid,
            badgeId: badge.id,
            badgeName: badge.name,
            category: badge.category,
            rank: badge.rank,
            earnedAt: new Date().toISOString()
          };

          await easClient.saveBadgeEarned(badgeData, signer);
          console.log(`Badge ${badge.name} awarded to user ${fid}`);
        }
      }
    } catch (error) {
      console.error('Error checking badges:', error);
    }
  }


  async getAvailableTasks(fid: number): Promise<any[]> {
    try {
      const completedTasks = await easClient.getUserTaskCompletions(fid);
      const completedTaskIds = new Set(completedTasks.map(task => task.taskId));


      const allTasks = [
        ...DYNAMIC_TASKS.daily,
        ...DYNAMIC_TASKS.weekly,
        ...DYNAMIC_TASKS.special
      ];

      return allTasks.filter(task => !completedTaskIds.has(task.id));
    } catch (error) {
      console.error('Error getting available tasks:', error);
      return [];
    }
  }


  async getUserProgress(fid: number): Promise<any> {
    try {
      const userScore = await this.getUserScore(fid);
      const userBadges = await easClient.getUserBadges(fid);
      const completedTasks = await easClient.getUserTaskCompletions(fid);
      const activityLog = await easClient.getUserActivityLog(fid, 50);

      if (!userScore) {
        return {
          hasProfile: false,
          message: 'User not found'
        };
      }

      return {
        hasProfile: true,
        score: userScore,
        badges: userBadges,
        completedTasks: completedTasks.length,
        recentActivities: activityLog,
        progress: {
          total: calculateProgress(userScore.totalScore),
          builder: calculateProgress(userScore.categoryScores.Builder),
          social: calculateProgress(userScore.categoryScores.Social),
          degen: calculateProgress(userScore.categoryScores.Degen),
          player: calculateProgress(userScore.categoryScores.Player)
        }
      };
    } catch (error) {
      console.error('Error getting user progress:', error);
      return { hasProfile: false, error: 'Failed to load progress' };
    }
  }


  async getLeaderboards(): Promise<LeaderboardResult> {
    try {
      const globalLeaderboard = await easClient.getGlobalLeaderboard(100);
      const categoryLeaderboards = {
        Builder: await easClient.getCategoryLeaderboard('Builder', 50),
        Social: await easClient.getCategoryLeaderboard('Social', 50),
        Degen: await easClient.getCategoryLeaderboard('Degen', 50),
        Player: await easClient.getCategoryLeaderboard('Player', 50)
      };

      return {
        global: globalLeaderboard,
        categories: categoryLeaderboards
      };
    } catch (error) {
      console.error('Error getting leaderboards:', error);
      return { 
        global: [], 
        categories: {
          Builder: [],
          Social: [],
          Degen: [],
          Player: []
        }
      };
    }
  }


  async verifyOnChainActivity(
    fid: number,
    activityType: string,
    network: string = 'base'
  ): Promise<boolean> {
    try {

      
      switch (activityType) {
        case 'deploy':

          return await this.verifyContractDeployment(fid, network);
        case 'swap':

          return await this.verifyTokenSwap(fid, network);
        case 'stake':

          return await this.verifyStaking(fid, network);
        default:
          return false;
      }
    } catch (error) {
      console.error('Error verifying on-chain activity:', error);
      return false;
    }
  }


  private async verifyContractDeployment(fid: number, network: string): Promise<boolean> {

    return false; 
  }


  private async verifyTokenSwap(fid: number, network: string): Promise<boolean> {

    return false; 
  }


  private async verifyStaking(fid: number, network: string): Promise<boolean> {

    return false; 
  }


  async verifyFarcasterActivity(
    fid: number,
    activityType: string,
    verificationConfig: VerificationConfig
  ): Promise<boolean> {
    try {
 
      switch (activityType) {
        case 'publish':
          return await this.verifyCastPublication(fid, verificationConfig);
        case 'interact':
          return await this.verifyCastInteraction(fid, verificationConfig);
        case 'reply':
          return await this.verifyCastReply(fid, verificationConfig);
        default:
          return false;
      }
    } catch (error) {
      console.error('Error verifying Farcaster activity:', error);
      return false;
    }
  }


  private async verifyCastPublication(fid: number, config: VerificationConfig): Promise<boolean> {
 
    return false; 
  }

  private async verifyCastInteraction(fid: number, config: VerificationConfig): Promise<boolean> {

    return false; 
  }


  private async verifyCastReply(fid: number, config: VerificationConfig): Promise<boolean> {

    return false; 
  }
}

export const scoringEngine = new ScoringEngine();
