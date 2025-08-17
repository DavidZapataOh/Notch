import { Rank, Category, Action } from './types';

export const RANK_THRESHOLDS: Record<Rank, number> = {
  Mini: 0,
  Core: 100,
  Plus: 500,
  Pro: 1000,
  ProMax: 2500,
};

export const RANK_COLORS: Record<Rank, string> = {
  Mini: '#6B7280',
  Core: '#10B981',
  Plus: '#3B82F6',
  Pro: '#8B5CF6',
  ProMax: '#F59E0B',
};

export const ACTIONS: Record<Category, Action[]> = {
  Builder: [
    {
      id: 'deploy-contract',
      type: 'deploy',
      category: 'Builder',
      points: 100,
      description: 'Desplegar un contrato inteligente',
      cooldown: 'weekly',
    },
    {
      id: 'contribute-code',
      type: 'contribute',
      category: 'Builder',
      points: 25,
      description: 'Contribuir código a un proyecto',
      cooldown: 'daily',
    },
    {
      id: 'review-pr',
      type: 'review',
      category: 'Builder',
      points: 15,
      description: 'Revisar un Pull Request',
      cooldown: 'daily',
    },
  ],
  Social: [
    {
      id: 'publish-cast',
      type: 'publish',
      category: 'Social',
      points: 10,
      description: 'Publicar un cast',
      cooldown: 'daily',
    },
    {
      id: 'interact-cast',
      type: 'interact',
      category: 'Social',
      points: 5,
      description: 'Interactuar con un cast (like, recast)',
      cooldown: 'daily',
    },
    {
      id: 'reply-cast',
      type: 'reply',
      category: 'Social',
      points: 8,
      description: 'Responder a un cast',
      cooldown: 'daily',
    },
  ],
  Degen: [
    {
      id: 'swap-tokens',
      type: 'swap',
      category: 'Degen',
      points: 20,
      description: 'Hacer swap de tokens',
      cooldown: 'daily',
    },
    {
      id: 'mint-nft',
      type: 'mint',
      category: 'Degen',
      points: 50,
      description: 'Mintear un NFT',
      cooldown: 'weekly',
    },
    {
      id: 'stake-tokens',
      type: 'stake',
      category: 'Degen',
      points: 30,
      description: 'Hacer staking de tokens',
      cooldown: 'weekly',
    },
  ],
  Player: [
    {
      id: 'use-miniapp',
      type: 'miniapp',
      category: 'Player',
      points: 15,
      description: 'Usar otra miniapp',
      cooldown: 'daily',
    },
    {
      id: 'complete-quest',
      type: 'quest',
      category: 'Player',
      points: 25,
      description: 'Completar una quest',
      cooldown: 'weekly',
    },
    {
      id: 'invite-friend',
      type: 'invite',
      category: 'Player',
      points: 40,
      description: 'Invitar a un amigo',
      cooldown: 'weekly',
    },
  ],
};

export function calculateRank(points: number): Rank {
  if (points >= RANK_THRESHOLDS.ProMax) return 'ProMax';
  if (points >= RANK_THRESHOLDS.Pro) return 'Pro';
  if (points >= RANK_THRESHOLDS.Plus) return 'Plus';
  if (points >= RANK_THRESHOLDS.Core) return 'Core';
  return 'Mini';
}

export function calculateProgress(points: number): number {
  const currentRank = calculateRank(points);
  const nextRank = getNextRank(currentRank);
  
  if (!nextRank) return 100;
  
  const currentThreshold = RANK_THRESHOLDS[currentRank];
  const nextThreshold = RANK_THRESHOLDS[nextRank];
  const progress = ((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  
  return Math.min(Math.max(progress, 0), 100);
}

export function getNextRank(currentRank: Rank): Rank | null {
  const ranks: Rank[] = ['Mini', 'Core', 'Plus', 'Pro', 'ProMax'];
  const currentIndex = ranks.indexOf(currentRank);
  return currentIndex < ranks.length - 1 ? ranks[currentIndex + 1] : null;
}

export function canPerformAction(action: Action, lastPerformed?: string): boolean {
  if (action.cooldown === 'none') return true;
  if (!lastPerformed) return true;
  
  const lastDate = new Date(lastPerformed);
  const now = new Date();
  
  if (action.cooldown === 'daily') {
    return now.getDate() !== lastDate.getDate() || 
           now.getMonth() !== lastDate.getMonth() || 
           now.getFullYear() !== lastDate.getFullYear();
  }
  
  if (action.cooldown === 'weekly') {
    const lastWeek = new Date(lastDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    return now >= lastWeek;
  }
  
  return true;
}
