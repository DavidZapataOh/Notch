import { useState, useEffect, useCallback } from 'react';
import { useWalletClient } from 'wagmi';
import { scoringEngine, DYNAMIC_TASKS } from '../scoring-engine';
import { easClient, UserScoreData, TaskCompletionData, BadgeEarnedData, ActivityLogData } from '../eas-client';
import { Category } from '../types';

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

interface Task {
  id: string;
  title: string;
  description: string;
  category: Category;
  points: number;
  verificationMethod: string;
  verificationConfig: VerificationConfig;
}

export interface UseScoringReturn {
  userScore: UserScoreData | null;
  userBadges: BadgeEarnedData[];
  completedTasks: TaskCompletionData[];
  recentActivities: ActivityLogData[];
  availableTasks: Task[];
  
  loading: boolean;
  error: string | null;
  
  // Funciones
  refreshScore: () => Promise<void>;
  addPoints: (category: Category, points: number, activityType: string, metadata?: ActivityMetadata) => Promise<void>;
  completeTask: (taskId: string, category: Category, points: number, verificationData?: VerificationData) => Promise<boolean>;
  verifyActivity: (activityType: string, verificationConfig?: VerificationConfig) => Promise<boolean>;
  
  // Progreso
  progress: {
    total: number;
    builder: number;
    social: number;
    degen: number;
    player: number;
  } | null;
}

export function useScoring(fid?: number): UseScoringReturn {
  const { data: walletClient } = useWalletClient();
  
  const [userScore, setUserScore] = useState<UserScoreData | null>(null);
  const [userBadges, setUserBadges] = useState<BadgeEarnedData[]>([]);
  const [completedTasks, setCompletedTasks] = useState<TaskCompletionData[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityLogData[]>([]);
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<UseScoringReturn['progress']>(null);

  const loadUserData = useCallback(async (userId: number) => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [
        score,
        badges,
        tasks,
        activities,
        tasksAvailable
      ] = await Promise.all([
        scoringEngine.getUserScore(userId),
        easClient.getUserBadges(userId),
        easClient.getUserTaskCompletions(userId),
        easClient.getUserActivityLog(userId, 50),
        scoringEngine.getAvailableTasks(userId)
      ]);

      setUserScore(score);
      setUserBadges(badges);
      setCompletedTasks(tasks);
      setRecentActivities(activities);
      setAvailableTasks(tasksAvailable);

      if (score) {
        const progressData = {
          total: ((score.totalScore % 100) / 100) * 100,
          builder: ((score.categoryScores.Builder % 100) / 100) * 100,
          social: ((score.categoryScores.Social % 100) / 100) * 100,
          degen: ((score.categoryScores.Degen % 100) / 100) * 100,
          player: ((score.categoryScores.Player % 100) / 100) * 100,
        };
        setProgress(progressData);
      }
    } catch (err) {
      console.error('Error loading user data:', err);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshScore = useCallback(async () => {
    if (fid) {
      await loadUserData(fid);
    }
  }, [fid, loadUserData]);

  const addPoints = useCallback(async (
    category: Category, 
    points: number, 
    activityType: string, 
    metadata: ActivityMetadata = {}
  ) => {
    if (!fid || !walletClient) {
      setError('Wallet not connected');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updatedScore = await scoringEngine.addPoints(
        fid,
        category,
        points,
        activityType,
        metadata,
        walletClient
      );

      setUserScore(updatedScore);
      
      const [badges, activities] = await Promise.all([
        easClient.getUserBadges(fid),
        easClient.getUserActivityLog(fid, 50)
      ]);

      setUserBadges(badges);
      setRecentActivities(activities);

      if (updatedScore) {
        const progressData = {
          total: ((updatedScore.totalScore % 100) / 100) * 100,
          builder: ((updatedScore.categoryScores.Builder % 100) / 100) * 100,
          social: ((updatedScore.categoryScores.Social % 100) / 100) * 100,
          degen: ((updatedScore.categoryScores.Degen % 100) / 100) * 100,
          player: ((updatedScore.categoryScores.Player % 100) / 100) * 100,
        };
        setProgress(progressData);
      }
    } catch (err) {
      console.error('Error adding points:', err);
      setError('Failed to add points');
    } finally {
      setLoading(false);
    }
  }, [fid, walletClient]);

  const completeTask = useCallback(async (
    taskId: string,
    category: Category,
    points: number,
    verificationData: VerificationData = {}
  ): Promise<boolean> => {
    if (!fid || !walletClient) {
      setError('Wallet not connected');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const success = await scoringEngine.completeTask(
        fid,
        taskId,
        category,
        points,
        verificationData,
        walletClient
      );

      if (success) {
        await loadUserData(fid);
      }

      return success;
    } catch (err) {
      console.error('Error completing task:', err);
      setError('Failed to complete task');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fid, walletClient, loadUserData]);

  const verifyActivity = useCallback(async (
    activityType: string,
    verificationConfig: VerificationConfig = {}
  ): Promise<boolean> => {
    if (!fid) {
      setError('User ID not available');
      return false;
    }

    try {
      if (verificationConfig.network) {
        return await scoringEngine.verifyOnChainActivity(fid, activityType, verificationConfig.network);
      }
      
      if (verificationConfig.farcaster) {
        return await scoringEngine.verifyFarcasterActivity(fid, activityType, verificationConfig);
      }

      return false;
    } catch (err) {
      console.error('Error verifying activity:', err);
      setError('Failed to verify activity');
      return false;
    }
  }, [fid]);

  useEffect(() => {
    if (fid) {
      loadUserData(fid);
    }
  }, [fid, loadUserData]);

  return {
    userScore,
    userBadges,
    completedTasks,
    recentActivities,
    availableTasks,
    loading,
    error,
    refreshScore,
    addPoints,
    completeTask,
    verifyActivity,
    progress
  };
}

export function useLeaderboards() {
  const [globalLeaderboard, setGlobalLeaderboard] = useState<UserScoreData[]>([]);
  const [categoryLeaderboards, setCategoryLeaderboards] = useState<Record<Category, UserScoreData[]>>({} as Record<Category, UserScoreData[]>);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLeaderboards = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const leaderboards = await scoringEngine.getLeaderboards();
      setGlobalLeaderboard(leaderboards.global);
      setCategoryLeaderboards(leaderboards.categories);
    } catch (err) {
      console.error('Error loading leaderboards:', err);
      setError('Failed to load leaderboards');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeaderboards();
  }, [loadLeaderboards]);

  return {
    globalLeaderboard,
    categoryLeaderboards,
    loading,
    error,
    refresh: loadLeaderboards
  };
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const allTasks = [
        ...DYNAMIC_TASKS.daily,
        ...DYNAMIC_TASKS.weekly,
        ...DYNAMIC_TASKS.special
      ];

      setTasks(allTasks);
    } catch (err) {
      console.error('Error loading tasks:', err);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return {
    tasks,
    loading,
    error,
    refresh: loadTasks
  };
}

export function useAutoVerification(fid?: number) {
  const [verifying, setVerifying] = useState(false);
  const [lastVerification, setLastVerification] = useState<Date | null>(null);

  const verifyUserActivities = useCallback(async () => {
    if (!fid) return;

    setVerifying(true);

    try {
      const farcasterVerified = await scoringEngine.verifyFarcasterActivity(
        fid,
        'publish',
        { keywords: ['notch', '@notch', '#notch'] }
      );

      const onchainVerified = await scoringEngine.verifyOnChainActivity(
        fid,
        'swap',
        'base'
      );

      setLastVerification(new Date());

      return {
        farcaster: farcasterVerified,
        onchain: onchainVerified
      };
    } catch (err) {
      console.error('Error in auto verification:', err);
      return { farcaster: false, onchain: false };
    } finally {
      setVerifying(false);
    }
  }, [fid]);

  return {
    verifying,
    lastVerification,
    verifyUserActivities
  };
}
