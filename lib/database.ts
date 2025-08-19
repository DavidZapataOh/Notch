export interface User {
    fid: number;
    username: string;
    pfp_url?: string;
    totalScore: number;
    season: number;
    lastUpdated: string;
    consecutiveDays: number;
    lastActiveDate: string;
    categories: {
      Social: { score: number; weeklyScore: number; dailyScore: number };
      Builder: { score: number; weeklyScore: number; dailyScore: number };
      Degen: { score: number; weeklyScore: number; dailyScore: number };
      Player: { score: number; weeklyScore: number; dailyScore: number };
    };
    completedTasks: string[];
  }
  
  export interface Action {
    id: string;
    fid: number;
    type: 'cast' | 'comment' | 'like' | 'recast' | 'contract_deploy' | 'token_create' | 'nft_create' | 'swap' | 'miniapp_interaction' | 'special_task';
    category: 'Social' | 'Builder' | 'Degen' | 'Player';
    points: number;
    metadata: Record<string, unknown>;
    timestamp: string;
    verified: boolean;
  }
  
  export interface SpecialTask {
    id: string;
    title: string;
    description: string;
    category: 'Social' | 'Builder' | 'Degen' | 'Player';
    points: number;
    startDate: string;
    endDate: string;
    verificationMethod: 'farcaster_api' | 'onchain' | 'eas_attestation';
    verificationConfig: Record<string, unknown>;
    active: boolean;
  }