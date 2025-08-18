"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useMiniKit, useAuthenticate, useViewProfile } from '@coinbase/onchainkit/minikit';
import { UserScore, EvolutionData } from '../../lib/types';
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
  const [userScore, setUserScore] = useState<UserScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthenticatedUser | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationType, setCelebrationType] = useState<'success' | 'levelUp' | 'achievement'>('success');
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [currentSeason, setCurrentSeason] = useState<any>(null);

  const userFid = context?.user?.fid || 12345;
  const username = context?.user?.username || 'Demo User';
  
  const viewProfile = useViewProfile();

  const fetchUserScore = useCallback(async (fid: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/user/score?fid=${fid}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user score');
      }
      
      const scoreData = await response.json();
      
      const generateEvolution = (): EvolutionData[] => {
        const data: EvolutionData[] = [];
        const today = new Date();
        
        for (let i = 29; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          
          const baseScore = scoreData.totalScore * (0.7 + (29 - i) * 0.01);
          const variation = Math.random() * 100 - 50;
          
          data.push({
            date: date.toISOString(),
            totalScore: Math.max(0, Math.floor(baseScore + variation)),
            categoryScores: {
              Builder: Math.floor((baseScore + variation) * 0.4),
              Social: Math.floor((baseScore + variation) * 0.3),
              Degen: Math.floor((baseScore + variation) * 0.2),
              Player: Math.floor((baseScore + variation) * 0.1),
            },
            rank: scoreData.categories[scoreData.primaryCategory].rank,
            primaryCategory: scoreData.primaryCategory
          });
        }
        
        return data;
      };

      const enrichedScoreData = {
        ...scoreData,
        evolution: generateEvolution(),
      };
      
      setUserScore(enrichedScoreData);
      
    } catch (error) {
      console.error('Error fetching user score:', error);
      
      if (window.location.hostname === 'localhost') {
        setUserScore({
          fid: userFid,
          username: username || `@fid${userFid}`,
          avatar: '',
          totalScore: 1250,
          categories: {
            Builder: { score: 450, rank: 'Plus', level: 3, progress: 85 },
            Social: { score: 320, rank: 'Plus', level: 2, progress: 65 },
            Degen: { score: 280, rank: 'Core', level: 2, progress: 90 },
            Player: { score: 200, rank: 'Core', level: 1, progress: 40 },
          },
          primaryCategory: 'Builder',
          badges: [],
          season: 1,
          lastUpdated: new Date().toISOString(),
          evolution: [],
          rankings: {
            global: 4,
            categories: {
              Builder: 2,
              Social: 8,
              Degen: 12,
              Player: 25,
            }
          },
          totalUsers: 1547,
        });
      } else {
        setUserScore(null);
      }
    } finally {
      setLoading(false);
    }
  }, [userFid, username]);

  const fetchCurrentSeason = useCallback(async () => {
    try {
      const response = await fetch('/api/seasons');
      if (response.ok) {
        const season = await response.json();
        setCurrentSeason(season);
      }
    } catch (error) {
      console.error('Error fetching season:', error);
    }
  }, []);

  useEffect(() => {
    fetchUserScore(userFid);
    fetchCurrentSeason();
  }, [fetchUserScore, userFid, fetchCurrentSeason]);

  const handleProtectedAction = useCallback(async (actionId: string) => {
    if (!authenticatedUser) {
      setLoading(true);
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
            setLoading(false);
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
          setLoading(false);
        }
      } catch (error) {
        console.error('Error en autenticación:', error);
        setLoading(false);
      }
    } else {
      setCelebrationType('success');
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);
      
      setTimeout(() => {
        fetchUserScore(userFid);
      }, 1000);
    }
  }, [authenticatedUser, signIn, userFid, username, fetchUserScore]);

  const handleViewProfile = useCallback(() => {
    if (window.location.hostname === 'localhost') {
      console.log('👤 Ver perfil (DEMO):', userFid);
      alert(`Ver perfil de ${username} (FID: ${userFid})`);
    } else {
      viewProfile(userFid);
    }
  }, [viewProfile, userFid, username]);

  if (!userScore) {
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
              userScore={userScore}
              onShareProgress={onShareProgress}
              handleViewProfile={handleViewProfile}
              loading={loading}
            />
          )}

          {activeTab === 'explorer' && (
            <ExplorerTab userScore={userScore} />
          )}

          {activeTab === 'tasks' && (
            <TasksTab 
              userScore={userScore}
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
