"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useMiniKit, useAuthenticate, useViewProfile } from '@coinbase/onchainkit/minikit';
import { useScoring, useLeaderboards, useTasks, useAutoVerification } from '../../lib/hooks/useScoring';
import { BottomNavigation } from './BottomNavigation';
import { DashboardTab } from './DashboardTab';
import { ExplorerTab } from './ExplorerTab';
import { TasksTab } from './TaskTab';
import { EmotionalFeedback } from './SharedComponents';

interface AuthenticatedUser {
  fid: number;
  username: string;
  authenticated: boolean;
}

interface NotchDashboardProps {
  onShareProgress: () => void;
}

type TabType = 'dashboard' | 'explorer' | 'tasks';

const DESIGN_SYSTEM = {
  neutral: {
    primary: '#0A0A0B',
    surface: '#1A1A1C',
    surfaceElevated: '#242427',
    border: '#38383A',
  },
  
  content: {
    primary: '#FFFFFF',
    secondary: '#8E8E93',
    tertiary: '#48484A',
  },
  
  brand: {
    primary: '#007AFF',
    success: '#32D74B',
    warning: '#FF9F0A',
    error: '#FF453A',
  },
  
  categories: {
    Builder: '#FF6B35',
    Social: '#32D74B', 
    Degen: '#007AFF',
    Player: '#FF9500'
  }
};

const TYPOGRAPHY = {
  sizes: {
    display: '28px',
    title: '20px',
    body: '16px',
    caption: '12px'
  },
  
  weights: {
    regular: '500',
    bold: '600'
  },
  
  letterSpacing: {
    display: '-0.025em',
    title: '-0.02em',
    body: '-0.01em',
    caption: '0em'
  }
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64
};

const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  nested: (outer: number, gap: number) => outer - gap
};

export function NotchDashboard({ onShareProgress }: NotchDashboardProps) {
  const { context } = useMiniKit();
  const { signIn } = useAuthenticate();
  
  // Usar el nuevo sistema de scoring
  const {
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
  } = useScoring(context?.user?.fid);
  
  const { globalLeaderboard, categoryLeaderboards } = useLeaderboards();
  const { tasks } = useTasks();
  const { verifyUserActivities } = useAutoVerification(context?.user?.fid);
  
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthenticatedUser | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationType, setCelebrationType] = useState<'success' | 'levelUp' | 'achievement'>('success');
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const userFid = context?.user?.fid || 12345;
  const username = context?.user?.username || 'Demo User';

  // Función para adaptar UserScoreData a UserScore
  const adaptUserScore = useCallback((scoreData: any): any => {
    if (!scoreData) return null;
    
    return {
      fid: scoreData.fid,
      username: username || `@fid${scoreData.fid}`,
      avatar: '',
      totalScore: scoreData.totalScore,
      categories: {
        Builder: { 
          score: scoreData.categoryScores.Builder, 
          rank: scoreData.rank, 
          level: scoreData.level, 
          progress: ((scoreData.categoryScores.Builder % 100) / 100) * 100 
        },
        Social: { 
          score: scoreData.categoryScores.Social, 
          rank: scoreData.rank, 
          level: scoreData.level, 
          progress: ((scoreData.categoryScores.Social % 100) / 100) * 100 
        },
        Degen: { 
          score: scoreData.categoryScores.Degen, 
          rank: scoreData.rank, 
          level: scoreData.level, 
          progress: ((scoreData.categoryScores.Degen % 100) / 100) * 100 
        },
        Player: { 
          score: scoreData.categoryScores.Player, 
          rank: scoreData.rank, 
          level: scoreData.level, 
          progress: ((scoreData.categoryScores.Player % 100) / 100) * 100 
        },
      },
      primaryCategory: 'Builder', // Determinar dinámicamente
      badges: userBadges.map(badge => ({
        id: badge.badgeId,
        name: badge.badgeName,
        description: '',
        category: badge.category,
        rank: badge.rank,
        earnedAt: badge.earnedAt,
        imageUrl: ''
      })),
      season: scoreData.season,
      lastUpdated: scoreData.lastUpdated,
      evolution: [],
      rankings: {
        global: 0,
        categories: {
          Builder: 0,
          Social: 0,
          Degen: 0,
          Player: 0,
        }
      },
      totalUsers: 0,
    };
  }, [username, userBadges]);
  
  const viewProfile = useViewProfile();

  // Función para manejar acciones protegidas
  const handleProtectedAction = useCallback(async (actionId: string) => {
    if (!authenticatedUser) {
      try {
        if (window.location.hostname === 'localhost') {
          setTimeout(() => {
            const mockUser: AuthenticatedUser = { 
              fid: userFid, 
              username: username,
              authenticated: true
            };
            setAuthenticatedUser(mockUser);
            
            if (actionId.includes('deploy')) {
              setCelebrationType('levelUp');
            } else if (actionId.includes('badge')) {
              setCelebrationType('achievement');
            } else {
              setCelebrationType('success');
            }
            
            setShowCelebration(true);
            setTimeout(() => setShowCelebration(false), 2500);
          }, 1000);
        } else {
          const result = await signIn();
          if (result) {
            const adaptedUser: AuthenticatedUser = {
              fid: userFid,
              username: username,
              authenticated: true
            };
            setAuthenticatedUser(adaptedUser);
            setShowCelebration(true);
            setTimeout(() => setShowCelebration(false), 2500);
          }
        }
      } catch (error) {
        console.error('Error en autenticación:', error);
      }
    } else {
      setCelebrationType('success');
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);
      
      setTimeout(() => {
        refreshScore();
      }, 1000);
    }
  }, [authenticatedUser, signIn, userFid, username, refreshScore]);

  const handleViewProfile = useCallback(() => {
    if (window.location.hostname === 'localhost') {
      console.log('👤 Ver perfil (DEMO):', userFid);
      alert(`Ver perfil de ${username} (FID: ${userFid})`);
    } else {
      viewProfile(userFid);
    }
  }, [viewProfile, userFid, username]);

  const adaptedUserScore = adaptUserScore(userScore);

  if (!adaptedUserScore) {
    return (
      <div 
        className="flex items-center justify-center"
        style={{ 
          backgroundColor: DESIGN_SYSTEM.neutral.primary,
          padding: `${SPACING.xxxl}px`
        }}
      >
        <div 
          className="animate-spin rounded-full border-b-2"
          style={{ 
            width: '32px',
            height: '32px',
            borderColor: DESIGN_SYSTEM.brand.primary
          }}
        ></div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: DESIGN_SYSTEM.neutral.primary }}
    >
      <div className="flex-1" style={{ padding: `${SPACING.md}px` }}>
        <EmotionalFeedback 
          show={showCelebration}
          type={celebrationType}
          message={
            celebrationType === 'levelUp' ? 'Level Up!' :
            celebrationType === 'achievement' ? 'Achievement Unlocked!' :
            'Great job!'
          }
          onComplete={() => setShowCelebration(false)}
        />

        {window.location.hostname === 'localhost' && (
          <div 
            className="border shadow-lg"
            style={{ 
              backgroundColor: DESIGN_SYSTEM.brand.warning + 'E6',
              borderColor: DESIGN_SYSTEM.brand.warning + '60',
              borderWidth: '0.5px',
              borderRadius: `${RADIUS.xl}px`,
              padding: `${SPACING.md}px`,
              marginBottom: `${SPACING.xl}px`
            }}
          >
            <div className="flex items-center" style={{ gap: `${SPACING.md}px` }}>
              <div 
                className="flex items-center justify-center"
                style={{ 
                  width: '24px', 
                  height: '24px',
                  backgroundColor: DESIGN_SYSTEM.brand.warning,
                  borderRadius: `${RADIUS.sm}px`
                }}
              >
                <span 
                  className="text-white"
                  style={{ 
                    fontSize: '12px',
                    fontWeight: TYPOGRAPHY.weights.bold
                  }}
                >
                  !
                </span>
              </div>
              <div>
                <div 
                  className="text-white"
                  style={{ 
                    fontSize: TYPOGRAPHY.sizes.caption,
                    fontWeight: TYPOGRAPHY.weights.bold,
                    letterSpacing: TYPOGRAPHY.letterSpacing.caption
                  }}
                >
                  Dev Mode
                </div>
                <div 
                  style={{ 
                    fontSize: '11px',
                    color: DESIGN_SYSTEM.content.primary + 'E6',
                    marginTop: '2px'
                  }}
                >
                  Using real Farcaster data • FID: {userFid}
                </div>
              </div>
            </div>
          </div>
        )}

        <div 
          className="transition-all duration-400 ease-out"
          style={{ 
            paddingBottom: `${SPACING.sm}px`,
            opacity: loading ? 0.7 : 1,
            transform: loading ? 'translateY(4px)' : 'translateY(0)'
          }}
        >
          {activeTab === 'dashboard' && (
            <DashboardTab 
              userScore={adaptedUserScore}
              onShareProgress={onShareProgress}
              handleViewProfile={handleViewProfile}
              loading={loading}
            />
          )}

          {activeTab === 'explorer' && (
            <ExplorerTab userScore={adaptedUserScore} />
          )}

          {activeTab === 'tasks' && (
            <TasksTab 
              userScore={adaptedUserScore}
              onProtectedAction={handleProtectedAction}
              loading={loading}
              authenticatedUser={authenticatedUser}
            />
          )}
        </div>
      </div>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
