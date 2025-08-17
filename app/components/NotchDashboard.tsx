"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useMiniKit, useAuthenticate, useViewProfile } from '@coinbase/onchainkit/minikit';
import { UserScore, Category, Rank, EvolutionData } from '../../lib/types';
import { getNextRank, RANK_THRESHOLDS } from '../../lib/scoring';
import { 
  Activity, 
  Users, 
  TrendingUp, 
  Gamepad2, 
  Share2, 
  ChevronRight,
  Star,
  Award,
  Target,
  Home,
  Search,
  CheckSquare,
  ArrowUp,
  ArrowDown,
  Minus,
  Calendar,
  LucideIcon,
} from 'lucide-react';

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

const CATEGORY_ICONS: Record<Category, LucideIcon> = {
  Builder: Activity,
  Social: Users,
  Degen: TrendingUp,
  Player: Gamepad2
};

const BottomNavigation = ({ activeTab, onTabChange }: {
  activeTab: TabType,
  onTabChange: (tab: TabType) => void
}) => {
  const [pressedTab, setPressedTab] = useState<TabType | null>(null);

  const tabs = [
    { 
      key: 'dashboard' as TabType, 
      icon: Home, 
      label: 'Home'
    },
    { 
      key: 'explorer' as TabType, 
      icon: Search, 
      label: 'Explore'
    },
    { 
      key: 'tasks' as TabType, 
      icon: CheckSquare, 
      label: 'Tasks',
      badge: 3
    }
  ];

  const handleTabPress = (tab: TabType) => {
    setPressedTab(tab);
    setTimeout(() => setPressedTab(null), 120);
    onTabChange(tab);
  };

  return (
    <div className="sticky bottom-0" style={{ padding: `${SPACING.md}px` }}>
      <div 
        className="backdrop-blur-2xl border-t shadow-lg"
        style={{ 
          backgroundColor: DESIGN_SYSTEM.neutral.surface + 'F8',
          borderTopColor: DESIGN_SYSTEM.neutral.border + '60',
          borderTopWidth: '0.5px',
          borderRadius: `${RADIUS.xl}px ${RADIUS.xl}px 0 0`,
          padding: `${SPACING.md}px ${SPACING.sm}px`,
          paddingBottom: `calc(${SPACING.md}px + env(safe-area-inset-bottom, 8px))`
        }}
      >
        <div className="flex items-center justify-around">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.key;
            const isPressed = pressedTab === tab.key;
            
            return (
              <button
                key={tab.key}
                onClick={() => handleTabPress(tab.key)}
                className="flex flex-col items-center justify-center relative transition-all duration-200"
                style={{ 
                  minWidth: '48px',
                  minHeight: '48px',
                  padding: `${SPACING.sm}px ${SPACING.md}px`,
                  borderRadius: `${RADIUS.md}px`,
                  backgroundColor: isActive ? DESIGN_SYSTEM.brand.primary + '12' : 'transparent',
                  transform: isPressed ? 'scale(0.95)' : isActive ? 'scale(1.05)' : 'scale(1)'
                }}
              >
                {isActive && (
                  <div 
                    className="absolute top-0 left-1/2 transform -translate-x-1/2 transition-all duration-300"
                    style={{ 
                      width: '24px',
                      height: '3px',
                      backgroundColor: DESIGN_SYSTEM.brand.primary,
                      borderRadius: '0 0 2px 2px'
                    }}
                  />
                )}

                <div className="relative">
                  <IconComponent 
                    size={24} 
                    color={isActive ? DESIGN_SYSTEM.brand.primary : DESIGN_SYSTEM.content.secondary}
                    className="transition-all duration-200"
                    fill={isActive ? DESIGN_SYSTEM.brand.primary : 'none'}
                    strokeWidth={isActive ? 0 : 2}
                  />
                  
                  {tab.badge && tab.badge > 0 && (
                    <div 
                      className="absolute flex items-center justify-center border-2"
                      style={{ 
                        top: '-6px',
                        right: '-6px',
                        width: tab.badge > 9 ? '20px' : '16px',
                        height: '16px',
                        backgroundColor: DESIGN_SYSTEM.brand.error,
                        borderColor: DESIGN_SYSTEM.neutral.surface,
                        borderRadius: '8px',
                        fontSize: '10px',
                        fontWeight: TYPOGRAPHY.weights.bold,
                        color: DESIGN_SYSTEM.content.primary
                      }}
                    >
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </div>
                  )}
                </div>

                <span 
                  className="transition-all duration-200"
                  style={{ 
                    fontSize: TYPOGRAPHY.sizes.caption,
                    fontWeight: isActive ? TYPOGRAPHY.weights.bold : TYPOGRAPHY.weights.regular,
                    letterSpacing: TYPOGRAPHY.letterSpacing.caption,
                    color: isActive ? DESIGN_SYSTEM.brand.primary : DESIGN_SYSTEM.content.secondary,
                    marginTop: `${SPACING.xs}px`
                  }}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const AppleRadarChart = ({ userScore, onCategorySelect }: { 
  userScore: UserScore, 
  onCategorySelect: (category: Category) => void 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<Category | null>(null);
  
  const categories = Object.keys(userScore.categories) as Category[];
  const centerX = 160;
  const centerY = 160;
  const maxRadius = 70;
  
  const getPointPosition = (index: number, progress: number) => {
    const angle = (index * 2 * Math.PI) / categories.length - Math.PI / 2;
    const radius = (progress / 100) * maxRadius;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  };

  const getLabelPosition = (index: number) => {
    const angle = (index * 2 * Math.PI) / categories.length - Math.PI / 2;
    const labelRadius = maxRadius + 70;
    return {
      x: centerX + labelRadius * Math.cos(angle),
      y: centerY + labelRadius * Math.sin(angle)
    };
  };

  const userPoints = categories.map((category, index) => {
    const progress = userScore.categories[category].progress;
    return getPointPosition(index, progress);
  });

  const userAreaPath = `M ${userPoints.map(p => `${p.x},${p.y}`).join(' L ')} Z`;

  return (
    <div className="relative w-full flex items-center justify-center" style={{ height: '460px' }}>
      <div className="relative">
        <svg width="320" height="320" className="overflow-visible">
          <defs>
            <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={DESIGN_SYSTEM.brand.primary} stopOpacity="0.08" />
              <stop offset="100%" stopColor={DESIGN_SYSTEM.brand.primary} stopOpacity="0.02" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {[25, 50, 75, 100].map(percent => (
            <circle
              key={percent}
              cx={centerX}
              cy={centerY}
              r={(percent / 100) * maxRadius}
              fill="none"
              stroke={DESIGN_SYSTEM.neutral.border}
              strokeWidth="0.5"
              opacity="0.5"
            />
          ))}
          
          {categories.map((category, index) => {
            const endPoint = getPointPosition(index, 100);
            return (
              <line
                key={category}
                x1={centerX}
                y1={centerY}
                x2={endPoint.x}
                y2={endPoint.y}
                stroke={DESIGN_SYSTEM.neutral.border}
                strokeWidth="0.5"
                opacity="0.4"
              />
            );
          })}
          
          <path
            d={userAreaPath}
            fill="url(#radarGradient)"
            stroke={DESIGN_SYSTEM.brand.primary}
            strokeWidth="2"
            filter="url(#glow)"
            className="transition-all duration-500 ease-out"
          />

          {categories.map((category, index) => {
            const point = getPointPosition(index, userScore.categories[category].progress);
            const isSelected = selectedCategory === category;
            const isHovered = hoveredCategory === category;
            
            return (
              <circle
                key={category}
                cx={point.x}
                cy={point.y}
                r={isSelected ? "8" : isHovered ? "7" : "6"}
                fill={DESIGN_SYSTEM.categories[category]}
                stroke={DESIGN_SYSTEM.neutral.primary}
                strokeWidth="3"
                className="cursor-pointer transition-all duration-200"
                filter="url(#glow)"
                onClick={() => {
                  const newSelection = isSelected ? null : category;
                  setSelectedCategory(newSelection);
                  onCategorySelect(category);
                }}
                onMouseEnter={() => setHoveredCategory(category)}
                onMouseLeave={() => setHoveredCategory(null)}
              />
            );
          })}
        </svg>

        {categories.map((category, index) => {
          const labelPos = getLabelPosition(index);
          const IconComponent = CATEGORY_ICONS[category];
          const isSelected = selectedCategory === category;
          const isHovered = hoveredCategory === category;

          return (
            <div
              key={category}
              className="absolute cursor-pointer transition-all duration-200"
              style={{ 
                left: labelPos.x - 60,
                top: labelPos.y - 45,
                width: '120px'
              }}
              onClick={() => {
                const newSelection = isSelected ? null : category;
                setSelectedCategory(newSelection);
                onCategorySelect(category);
              }}
              onMouseEnter={() => setHoveredCategory(category)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <div 
                className="flex flex-col items-center transition-all duration-200"
                style={{ 
                  padding: `${SPACING.sm}px`,
                  borderRadius: `${RADIUS.md}px`,
                  backgroundColor: isSelected ? DESIGN_SYSTEM.neutral.surfaceElevated : 'transparent',
                  border: isSelected ? `1px solid ${DESIGN_SYSTEM.neutral.border}` : 'none',
                  transform: isSelected ? 'scale(1.1)' : isHovered ? 'scale(1.05)' : 'scale(1)'
                }}
              >
                <div 
                  className="shadow-md transition-all duration-200"
                  style={{ 
                    width: '48px',
                    height: '48px',
                    borderRadius: `${RADIUS.md}px`,
                    backgroundColor: DESIGN_SYSTEM.categories[category] + '15',
                    border: `2px solid ${DESIGN_SYSTEM.categories[category]}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <IconComponent size={24} color={DESIGN_SYSTEM.categories[category]} />
                </div>
                <div className="text-center" style={{ marginTop: `${SPACING.xs}px` }}>
                  <div 
                    className="text-white"
                    style={{ 
                      fontSize: TYPOGRAPHY.sizes.caption,
                      fontWeight: TYPOGRAPHY.weights.bold,
                      letterSpacing: TYPOGRAPHY.letterSpacing.caption
                    }}
                  >
                    {category}
                  </div>
                  <div 
                    style={{ 
                      fontSize: '10px',
                      color: DESIGN_SYSTEM.content.secondary,
                      marginTop: '2px'
                    }}
                  >
                    #{userScore.rankings.categories[category]}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div 
          className="text-center backdrop-blur-md shadow-xl border"
          style={{ 
            backgroundColor: DESIGN_SYSTEM.neutral.primary + 'F5',
            borderColor: DESIGN_SYSTEM.neutral.border + '60',
            borderRadius: `${RADIUS.lg}px`,
            padding: `${SPACING.sm}px ${SPACING.md}px`,
            marginTop: '20px'
          }}
        >
          <div 
            className="text-white font-mono"
            style={{ 
              fontSize: TYPOGRAPHY.sizes.body,
              fontWeight: TYPOGRAPHY.weights.bold,
              letterSpacing: TYPOGRAPHY.letterSpacing.body
            }}
          >
            {userScore.totalScore.toLocaleString()}
          </div>
          <div 
            style={{ 
              fontSize: '10px',
              color: DESIGN_SYSTEM.content.secondary,
              fontWeight: TYPOGRAPHY.weights.regular,
              marginTop: '2px'
            }}
          >
            Total XP
          </div>
        </div>
      </div>
    </div>
  );
};

const AppleHeader = ({ userScore, onShareProgress, handleViewProfile, loading }: {
  userScore: UserScore,
  onShareProgress: () => void,
  handleViewProfile: () => void,
  loading: boolean
}) => {
  const primaryData = userScore.categories[userScore.primaryCategory];
  
  return (
    <div 
      className="border shadow-lg"
      style={{ 
        backgroundColor: DESIGN_SYSTEM.neutral.surface,
        borderColor: DESIGN_SYSTEM.neutral.border + '40',
        borderWidth: '0.5px',
        borderRadius: `${RADIUS.xl}px`,
        padding: `${SPACING.xl}px`
      }}
    >
      <div className="flex items-center justify-between" style={{ marginBottom: `${SPACING.xl}px` }}>
        <div className="flex items-center" style={{ gap: `${SPACING.md}px` }}>
          <div 
            className="bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
            style={{ 
              width: '64px',
              height: '64px',
              borderRadius: `${RADIUS.lg}px`
            }}
            onClick={handleViewProfile}
          >
            <div 
              className="text-white"
              style={{ 
                fontSize: TYPOGRAPHY.sizes.title,
                fontWeight: TYPOGRAPHY.weights.bold,
                letterSpacing: TYPOGRAPHY.letterSpacing.title
              }}
            >
              {userScore.username.charAt(1)?.toUpperCase() || 'U'}
            </div>
          </div>
          <div>
            <h1 
              className="text-white cursor-pointer hover:opacity-80 transition-opacity truncate" 
              onClick={handleViewProfile}
              style={{ 
                fontSize: TYPOGRAPHY.sizes.title,
                fontWeight: TYPOGRAPHY.weights.bold,
                letterSpacing: TYPOGRAPHY.letterSpacing.title,
                maxWidth: '180px'
              }}
            >
              {userScore.username}
            </h1>
            <div 
              className="flex items-center"
              style={{ 
                gap: `${SPACING.sm}px`,
                fontSize: TYPOGRAPHY.sizes.caption,
                color: DESIGN_SYSTEM.content.secondary,
                marginTop: `${SPACING.xs}px`
              }}
            >
              <span>S{userScore.season}</span>
              <div 
                className="rounded-full"
                style={{ 
                  width: '3px', 
                  height: '3px',
                  backgroundColor: DESIGN_SYSTEM.content.tertiary
                }}
              ></div>
              <span>#{userScore.rankings.global}</span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={onShareProgress}
          disabled={loading}
          className="flex items-center transition-all duration-200 hover:scale-105 active:scale-95"
          style={{ 
            gap: `${SPACING.sm}px`,
            padding: `${SPACING.sm}px ${SPACING.md}px`,
            borderRadius: `${RADIUS.md}px`,
            backgroundColor: DESIGN_SYSTEM.brand.primary,
            color: DESIGN_SYSTEM.content.primary
          }}
        >
          <Share2 size={16} />
          <span 
            style={{ 
              fontSize: TYPOGRAPHY.sizes.caption,
              fontWeight: TYPOGRAPHY.weights.bold,
              letterSpacing: TYPOGRAPHY.letterSpacing.caption
            }}
          >
            Share
          </span>
        </button>
      </div>

      <div className="grid grid-cols-3" style={{ gap: `${SPACING.md}px` }}>
        <div className="text-center">
          <div 
            className="text-white font-mono"
            style={{ 
              fontSize: TYPOGRAPHY.sizes.display,
              fontWeight: TYPOGRAPHY.weights.bold,
              letterSpacing: TYPOGRAPHY.letterSpacing.display
            }}
          >
            {userScore.totalScore.toLocaleString()}
          </div>
          <div 
            style={{ 
              fontSize: TYPOGRAPHY.sizes.caption,
              fontWeight: TYPOGRAPHY.weights.regular,
              color: DESIGN_SYSTEM.content.secondary,
              marginTop: `${SPACING.xs}px`
            }}
          >
            XP
          </div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center" style={{ gap: `${SPACING.xs}px` }}>
            <div 
              className="rounded-full"
              style={{ 
                width: '8px',
                height: '8px',
                backgroundColor: DESIGN_SYSTEM.categories[userScore.primaryCategory]
              }}
            ></div>
            <div 
              className="text-white"
              style={{ 
                fontSize: TYPOGRAPHY.sizes.display,
                fontWeight: TYPOGRAPHY.weights.bold,
                letterSpacing: TYPOGRAPHY.letterSpacing.display
              }}
            >
              {primaryData.rank}
            </div>
          </div>
          <div 
            style={{ 
              fontSize: TYPOGRAPHY.sizes.caption,
              fontWeight: TYPOGRAPHY.weights.regular,
              color: DESIGN_SYSTEM.content.secondary,
              marginTop: `${SPACING.xs}px`
            }}
          >
            Rank
          </div>
        </div>
        <div className="text-center">
          <div 
            className="text-white truncate"
            style={{ 
              fontSize: TYPOGRAPHY.sizes.body,
              fontWeight: TYPOGRAPHY.weights.bold,
              letterSpacing: TYPOGRAPHY.letterSpacing.body
            }}
          >
            {userScore.primaryCategory}
          </div>
          <div 
            style={{ 
              fontSize: TYPOGRAPHY.sizes.caption,
              fontWeight: TYPOGRAPHY.weights.regular,
              color: DESIGN_SYSTEM.content.secondary,
              marginTop: `${SPACING.xs}px`
            }}
          >
            Focus
          </div>
        </div>
      </div>
    </div>
  );
};

const AppleProgressRings = ({ userScore }: { userScore: UserScore }) => {
  const categories = Object.entries(userScore.categories);
  
  return (
    <div 
      className="border"
      style={{ 
        backgroundColor: DESIGN_SYSTEM.neutral.surface,
        borderColor: DESIGN_SYSTEM.neutral.border + '40',
        borderWidth: '0.5px',
        borderRadius: `${RADIUS.xl}px`,
        padding: `${SPACING.xl}px`
      }}
    >
      <h3 
        className="text-white flex items-center"
        style={{ 
          fontSize: TYPOGRAPHY.sizes.title,
          fontWeight: TYPOGRAPHY.weights.bold,
          letterSpacing: TYPOGRAPHY.letterSpacing.title,
          gap: `${SPACING.sm}px`,
          marginBottom: `${SPACING.xl}px`
        }}
      >
        <Target size={20} />
        <span>Activity</span>
      </h3>
      
      <div className="grid grid-cols-2" style={{ gap: `${SPACING.xl}px` }}>
        {categories.map(([category, data]) => {
          const IconComponent = CATEGORY_ICONS[category as Category];
          const nextRank = getNextRank(data.rank);
          const pointsToNext = nextRank ? RANK_THRESHOLDS[nextRank] - data.score : 0;
          const categoryColor = DESIGN_SYSTEM.categories[category as Category];
          
          return (
            <div key={category} className="flex flex-col" style={{ gap: `${SPACING.md}px` }}>
              <div className="flex items-center" style={{ gap: `${SPACING.md}px` }}>
                <div 
                  className="flex items-center justify-center shadow-sm"
                  style={{ 
                    width: '40px',
                    height: '40px',
                    borderRadius: `${RADIUS.md}px`,
                    backgroundColor: categoryColor + '15',
                    border: `1px solid ${categoryColor}60`
                  }}
                >
                  <IconComponent size={20} color={categoryColor} />
                </div>
                <div>
                  <div 
                    className="text-white"
                    style={{ 
                      fontSize: TYPOGRAPHY.sizes.body,
                      fontWeight: TYPOGRAPHY.weights.bold,
                      letterSpacing: TYPOGRAPHY.letterSpacing.body
                    }}
                  >
                    {category}
                  </div>
                  <div 
                    style={{ 
                      fontSize: TYPOGRAPHY.sizes.caption,
                      color: DESIGN_SYSTEM.content.secondary,
                      marginTop: '2px'
                    }}
                  >
                    Lv {data.level}
                  </div>
                </div>
              </div>
                    
              <div className="relative mx-auto" style={{ width: '80px', height: '80px' }}>
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                  <circle
                    cx="40"
                    cy="40"
                    r="35"
                    fill="none"
                    stroke={DESIGN_SYSTEM.neutral.surfaceElevated}
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="35"
                    fill="none"
                    stroke={categoryColor}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 35}`}
                    strokeDashoffset={`${2 * Math.PI * 35 * (1 - data.progress / 100)}`}
                    className="transition-all duration-1000 ease-out"
                    filter="url(#glow)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div 
                    className="text-white font-mono"
                    style={{ 
                      fontSize: TYPOGRAPHY.sizes.body,
                      fontWeight: TYPOGRAPHY.weights.bold,
                      letterSpacing: TYPOGRAPHY.letterSpacing.body
                    }}
                  >
                    {Math.round(data.progress)}%
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <div 
                  className="text-white font-mono"
                  style={{ 
                    fontSize: TYPOGRAPHY.sizes.body,
                    fontWeight: TYPOGRAPHY.weights.bold,
                    letterSpacing: TYPOGRAPHY.letterSpacing.body
                  }}
                >
                  {data.score.toLocaleString()}
                </div>
                {nextRank && (
                  <div 
                    style={{ 
                      fontSize: TYPOGRAPHY.sizes.caption,
                      color: DESIGN_SYSTEM.content.secondary,
                      marginTop: '2px'
                    }}
                  >
                    {pointsToNext.toLocaleString()} to {nextRank}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AppleBadges = ({ }: { userScore: UserScore }) => {
  const mockBadges = [
    { id: '1', name: 'Early Adopter', icon: Star },
    { id: '2', name: 'Builder', icon: Activity },
    { id: '3', name: 'Social', icon: Users },
    { id: '4', name: 'Trader', icon: TrendingUp },
    { id: '5', name: 'Helper', icon: Award },
  ];

  return (
    <div 
      className="border"
      style={{ 
        backgroundColor: DESIGN_SYSTEM.neutral.surface,
        borderColor: DESIGN_SYSTEM.neutral.border + '40',
        borderWidth: '0.5px',
        borderRadius: `${RADIUS.xl}px`,
        padding: `${SPACING.xl}px`
      }}
    >
      <h3 
        className="text-white flex items-center"
        style={{ 
          fontSize: TYPOGRAPHY.sizes.title,
          fontWeight: TYPOGRAPHY.weights.bold,
          letterSpacing: TYPOGRAPHY.letterSpacing.title,
          gap: `${SPACING.sm}px`,
          marginBottom: `${SPACING.xl}px`
        }}
      >
        <Award size={20} />
        <span>Achievements</span>
      </h3>
      
      <div className="grid grid-cols-5" style={{ gap: `${SPACING.md}px` }}>
        {mockBadges.map((badge) => {
          const IconComponent = badge.icon;
          return (
            <div key={badge.id} className="group relative">
              <div 
                className="flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer shadow-lg"
                style={{ 
                  width: '48px',
                  height: '48px',
                  borderRadius: `${RADIUS.lg}px`,
                  backgroundColor: DESIGN_SYSTEM.content.secondary + '15',
                  border: `1px solid ${DESIGN_SYSTEM.content.secondary}40`
                }}
              >
                <IconComponent size={22} color={DESIGN_SYSTEM.content.secondary} />
              </div>
              
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none" style={{ marginBottom: `${SPACING.sm}px` }}>
                <div 
                  className="text-white shadow-xl border"
                  style={{ 
                    backgroundColor: DESIGN_SYSTEM.neutral.primary + 'F5',
                    borderRadius: `${RADIUS.sm}px`,
                    padding: `${SPACING.xs}px ${SPACING.sm}px`,
                    fontSize: '11px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {badge.name}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const EmotionalFeedback = ({ 
  show, 
  type = 'success',
  message = 'Great job!',
  onComplete 
}: {
  show: boolean,
  type?: 'success' | 'levelUp' | 'achievement',
  message?: string,
  onComplete?: () => void
}) => {
  useEffect(() => {
    if (show && onComplete) {
      const timer = setTimeout(onComplete, 2500);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  const animations = {
    success: 'animate-bounce',
    levelUp: 'animate-pulse',
    achievement: 'animate-spin'
  };

  const emojis = {
    success: '🎉',
    levelUp: '🚀',
    achievement: '🏆'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="text-center">
        <div 
          className={`${animations[type]} mb-4`}
          style={{ 
            fontSize: '72px',
            filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))'
          }}
        >
          {emojis[type]}
        </div>
        <div 
          className="text-white font-bold bg-black/80 backdrop-blur-sm px-6 py-3 rounded-2xl"
          style={{ 
            fontSize: TYPOGRAPHY.sizes.title,
            letterSpacing: TYPOGRAPHY.letterSpacing.title
          }}
        >
          {message}
        </div>
      </div>
    </div>
  );
};

const ExplorerTab = ({ userScore }: { userScore: UserScore }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRankingType, setSelectedRankingType] = useState<'global' | Category>('global');

  const mockUsers = [
    { fid: 1, username: '@vitalik', score: 2500, rank: 'ProMax' as Rank, change: 0 },
    { fid: 2, username: '@dwr', score: 2200, rank: 'ProMax' as Rank, change: 1 },
    { fid: 3, username: '@jessepollak', score: 1800, rank: 'Pro' as Rank, change: -1 },
    { fid: userScore.fid, username: userScore.username, score: userScore.totalScore, rank: userScore.categories[userScore.primaryCategory].rank, change: 2 }
  ].sort((a, b) => b.score - a.score).map((user, index) => ({ ...user, position: index + 1 }));

  return (
    <div style={{ gap: `${SPACING.xl}px` }} className="flex flex-col">
      <div 
        className="border"
        style={{ 
          backgroundColor: DESIGN_SYSTEM.neutral.surface,
          borderColor: DESIGN_SYSTEM.neutral.border + '40',
          borderWidth: '0.5px',
          borderRadius: `${RADIUS.xl}px`,
          padding: `${SPACING.xl}px`
        }}
      >
        <h1 
          className="text-white"
          style={{ 
            fontSize: TYPOGRAPHY.sizes.display,
            fontWeight: TYPOGRAPHY.weights.bold,
            letterSpacing: TYPOGRAPHY.letterSpacing.display,
            marginBottom: `${SPACING.lg}px`
          }}
        >
          Explore
        </h1>
        
        <div className="relative" style={{ marginBottom: `${SPACING.xl}px` }}>
          <Search 
            size={20} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2" 
            color={DESIGN_SYSTEM.content.secondary}
          />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-white placeholder-gray-400 focus:outline-none transition-all duration-200"
            style={{ 
              backgroundColor: DESIGN_SYSTEM.neutral.surfaceElevated,
              border: `1px solid ${DESIGN_SYSTEM.neutral.border}`,
              borderRadius: `${RADIUS.md}px`,
              padding: `${SPACING.md}px ${SPACING.md}px ${SPACING.md}px ${SPACING.xxl}px`,
              fontSize: TYPOGRAPHY.sizes.body,
              letterSpacing: TYPOGRAPHY.letterSpacing.body
            }}
          />
        </div>

        <div className="flex overflow-x-auto" style={{ gap: `${SPACING.sm}px`, paddingBottom: `${SPACING.sm}px` }}>
          <button
            onClick={() => setSelectedRankingType('global')}
            className="transition-all duration-200 hover:scale-105 active:scale-95"
            style={{ 
              padding: `${SPACING.sm}px ${SPACING.md}px`,
              borderRadius: `${RADIUS.md}px`,
              fontSize: TYPOGRAPHY.sizes.caption,
              fontWeight: TYPOGRAPHY.weights.bold,
              letterSpacing: TYPOGRAPHY.letterSpacing.caption,
              backgroundColor: selectedRankingType === 'global' ? DESIGN_SYSTEM.brand.primary : DESIGN_SYSTEM.neutral.surfaceElevated,
              color: selectedRankingType === 'global' ? DESIGN_SYSTEM.content.primary : DESIGN_SYSTEM.content.secondary,
              whiteSpace: 'nowrap'
            }}
          >
            Global
          </button>
          {Object.keys(userScore.categories).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedRankingType(category as Category)}
              className="flex items-center transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ 
                gap: `${SPACING.xs}px`,
                padding: `${SPACING.sm}px ${SPACING.md}px`,
                borderRadius: `${RADIUS.md}px`,
                fontSize: TYPOGRAPHY.sizes.caption,
                fontWeight: TYPOGRAPHY.weights.bold,
                letterSpacing: TYPOGRAPHY.letterSpacing.caption,
                backgroundColor: selectedRankingType === category ? DESIGN_SYSTEM.brand.primary : DESIGN_SYSTEM.neutral.surfaceElevated,
                color: selectedRankingType === category ? DESIGN_SYSTEM.content.primary : DESIGN_SYSTEM.content.secondary,
                whiteSpace: 'nowrap'
              }}
            >
              {React.createElement(CATEGORY_ICONS[category as Category], { size: 16 })}
              {category}
            </button>
          ))}
        </div>
      </div>

      <div 
        className="border"
        style={{ 
          backgroundColor: DESIGN_SYSTEM.neutral.surface,
          borderColor: DESIGN_SYSTEM.neutral.border + '40',
          borderWidth: '0.5px',
          borderRadius: `${RADIUS.xl}px`,
          padding: `${SPACING.xl}px`
        }}
      >
        <div style={{ gap: `${SPACING.md}px` }} className="flex flex-col">
          {mockUsers.filter(user => 
            user.username.toLowerCase().includes(searchQuery.toLowerCase())
          ).slice(0, 10).map((user) => {
            const isCurrentUser = user.fid === userScore.fid;
            
            return (
              <div
                key={user.fid}
                className="flex items-center justify-between transition-all duration-200 hover:scale-102 cursor-pointer"
                style={{ 
                  padding: `${SPACING.md}px`,
                  borderRadius: `${RADIUS.md}px`,
                  backgroundColor: isCurrentUser 
                    ? DESIGN_SYSTEM.brand.primary + '15' 
                    : DESIGN_SYSTEM.neutral.surfaceElevated,
                  border: isCurrentUser 
                    ? `1px solid ${DESIGN_SYSTEM.brand.primary}40` 
                    : `1px solid ${DESIGN_SYSTEM.neutral.border}40`
                }}
              >
                <div className="flex items-center" style={{ gap: `${SPACING.md}px` }}>
                  <div 
                    className="flex items-center justify-center font-bold"
                    style={{ 
                      width: '32px',
                      height: '32px',
                      borderRadius: `${RADIUS.sm}px`,
                      backgroundColor: user.position <= 3 
                        ? user.position === 1 ? '#FFD700' 
                          : user.position === 2 ? '#C0C0C0'
                          : '#CD7F32'
                        : DESIGN_SYSTEM.neutral.surfaceElevated,
                      color: user.position <= 3 ? '#000000' : DESIGN_SYSTEM.content.primary,
                      fontSize: TYPOGRAPHY.sizes.caption
                    }}
                  >
                    {user.position}
                  </div>
                  
                  <div className="flex items-center" style={{ gap: `${SPACING.md}px` }}>
                    <div 
                      className="bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold"
                      style={{ 
                        width: '40px',
                        height: '40px',
                        borderRadius: `${RADIUS.md}px`
                      }}
                    >
                      {user.username.charAt(1)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div 
                        className="text-white"
                        style={{ 
                          fontSize: TYPOGRAPHY.sizes.body,
                          fontWeight: TYPOGRAPHY.weights.bold,
                          letterSpacing: TYPOGRAPHY.letterSpacing.body
                        }}
                      >
                        {user.username}
                      </div>
                      <div 
                        className="flex items-center"
                        style={{ 
                          gap: `${SPACING.xs}px`,
                          fontSize: TYPOGRAPHY.sizes.caption,
                          color: DESIGN_SYSTEM.content.secondary,
                          marginTop: '2px'
                        }}
                      >
                        <div 
                          className="rounded-full"
                          style={{ 
                            width: '8px',
                            height: '8px',
                            backgroundColor: DESIGN_SYSTEM.categories[userScore.primaryCategory]
                          }}
                        ></div>
                        <span>{user.rank}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div 
                    className="text-white font-mono"
                    style={{ 
                      fontSize: TYPOGRAPHY.sizes.body,
                      fontWeight: TYPOGRAPHY.weights.bold,
                      letterSpacing: TYPOGRAPHY.letterSpacing.body
                    }}
                  >
                    {user.score.toLocaleString()}
                  </div>
                  <div className="flex items-center justify-end" style={{ gap: `${SPACING.xs}px` }}>
                    {user.change > 0 && <ArrowUp size={12} className="text-green-500" />}
                    {user.change < 0 && <ArrowDown size={12} className="text-red-500" />}
                    {user.change === 0 && <Minus size={12} className="text-gray-400" />}
                    <span 
                      style={{ 
                        fontSize: '10px',
                        color: DESIGN_SYSTEM.content.secondary
                      }}
                    >
                      {user.change !== 0 ? Math.abs(user.change) : '—'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const TasksTab = ({ onProtectedAction, loading }: {
  userScore: UserScore,
  onProtectedAction: (actionId: string) => void,
  loading: boolean,
  authenticatedUser: AuthenticatedUser | null
}) => {
  const [completedTask, setCompletedTask] = useState<string | null>(null);

  const dailyTasks = [
    { 
      id: 'daily-cast', 
      category: 'Social' as Category, 
      title: 'Share',
      description: 'Post something interesting', 
      points: 10, 
      progress: 0, 
      maxProgress: 1,
      completed: false
    },
    { 
      id: 'daily-interact', 
      category: 'Social' as Category, 
      title: 'Engage', 
      description: 'Like and comment on 5 casts', 
      points: 15, 
      progress: 2, 
      maxProgress: 5,
      completed: false
    },
    { 
      id: 'daily-build', 
      category: 'Builder' as Category, 
      title: 'Code', 
      description: 'Make a commit to any repo', 
      points: 25, 
      progress: 0, 
      maxProgress: 1,
      completed: false
    }
  ];

  const handleTaskAction = (taskId: string) => {
    setCompletedTask(taskId);
    setTimeout(() => setCompletedTask(null), 2000);
    onProtectedAction(taskId);
  };

  return (
    <div style={{ gap: `${SPACING.xl}px` }} className="flex flex-col">
      <EmotionalFeedback 
        show={!!completedTask}
        type="success"
        message="Task Complete! +XP"
        onComplete={() => setCompletedTask(null)}
      />

      <div 
        className="border"
        style={{ 
          backgroundColor: DESIGN_SYSTEM.neutral.surface,
          borderColor: DESIGN_SYSTEM.neutral.border + '40',
          borderWidth: '0.5px',
          borderRadius: `${RADIUS.xl}px`,
          padding: `${SPACING.xl}px`
        }}
      >
        <h1 
          className="text-white"
          style={{ 
            fontSize: TYPOGRAPHY.sizes.display,
            fontWeight: TYPOGRAPHY.weights.bold,
            letterSpacing: TYPOGRAPHY.letterSpacing.display,
            marginBottom: `${SPACING.lg}px`
          }}
        >
          Tasks
        </h1>
        
        <div 
          className="text-center"
          style={{ 
            padding: `${SPACING.lg}px`,
            backgroundColor: DESIGN_SYSTEM.neutral.surfaceElevated,
            borderRadius: `${RADIUS.md}px`
          }}
        >
          <div 
            className="text-white font-mono"
            style={{ 
              fontSize: TYPOGRAPHY.sizes.display,
              fontWeight: TYPOGRAPHY.weights.bold,
              letterSpacing: TYPOGRAPHY.letterSpacing.display
            }}
          >
            {dailyTasks.filter(t => t.completed).length}/{dailyTasks.length}
          </div>
          <div 
            style={{ 
              fontSize: TYPOGRAPHY.sizes.caption,
              color: DESIGN_SYSTEM.content.secondary,
              marginTop: `${SPACING.xs}px`
            }}
          >
            Daily Progress
          </div>
        </div>
      </div>

      <div 
        className="border"
        style={{ 
          backgroundColor: DESIGN_SYSTEM.neutral.surface,
          borderColor: DESIGN_SYSTEM.neutral.border + '40',
          borderWidth: '0.5px',
          borderRadius: `${RADIUS.xl}px`,
          padding: `${SPACING.xl}px`
        }}
      >
        <div className="flex items-center" style={{ gap: `${SPACING.sm}px`, marginBottom: `${SPACING.xl}px` }}>
          <Calendar size={20} color={DESIGN_SYSTEM.brand.warning} />
          <h2 
            className="text-white"
            style={{ 
              fontSize: TYPOGRAPHY.sizes.title,
              fontWeight: TYPOGRAPHY.weights.bold,
              letterSpacing: TYPOGRAPHY.letterSpacing.title
            }}
          >
            Daily
          </h2>
          <div 
            style={{ 
              backgroundColor: DESIGN_SYSTEM.brand.warning + '20',
              color: DESIGN_SYSTEM.brand.warning,
              padding: `${SPACING.xs}px ${SPACING.sm}px`,
              borderRadius: `${RADIUS.sm}px`,
              fontSize: '10px',
              fontWeight: TYPOGRAPHY.weights.bold
            }}
          >
            23h 45m
          </div>
        </div>
        
        <div style={{ gap: `${SPACING.md}px` }} className="flex flex-col">
          {dailyTasks.map((task) => {
            const IconComponent = CATEGORY_ICONS[task.category];
            const categoryColor = DESIGN_SYSTEM.categories[task.category];
            const isCompleted = task.progress >= task.maxProgress;
            const progressPercentage = (task.progress / task.maxProgress) * 100;
            
            return (
              <div
                key={task.id}
                className="transition-all duration-200 hover:scale-102"
                style={{ 
                  padding: `${SPACING.md}px`,
                  borderRadius: `${RADIUS.md}px`,
                  backgroundColor: isCompleted 
                    ? DESIGN_SYSTEM.brand.success + '15' 
                    : DESIGN_SYSTEM.neutral.surfaceElevated,
                  border: isCompleted 
                    ? `1px solid ${DESIGN_SYSTEM.brand.success}40` 
                    : `1px solid ${DESIGN_SYSTEM.neutral.border}40`
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center" style={{ gap: `${SPACING.md}px` }}>
                    <div 
                      className="flex items-center justify-center transition-all duration-200"
                      style={{ 
                        width: '40px',
                        height: '40px',
                        borderRadius: `${RADIUS.md}px`,
                        backgroundColor: categoryColor + '20',
                        border: `1px solid ${categoryColor}`
                      }}
                    >
                      {isCompleted ? (
                        <Star size={18} color={categoryColor} />
                      ) : (
                        <IconComponent size={18} color={categoryColor} />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 
                        className="text-white"
                        style={{ 
                          fontSize: TYPOGRAPHY.sizes.body,
                          fontWeight: TYPOGRAPHY.weights.bold,
                          letterSpacing: TYPOGRAPHY.letterSpacing.body
                        }}
                      >
                        {task.title}
                      </h3>
                      <p 
                        style={{ 
                          fontSize: TYPOGRAPHY.sizes.caption,
                          color: DESIGN_SYSTEM.content.secondary,
                          marginTop: '2px'
                        }}
                      >
                        {task.description}
                      </p>
                      
                      <div style={{ marginTop: `${SPACING.sm}px` }}>
                        <div 
                          className="flex items-center justify-between"
                          style={{ 
                            fontSize: '10px',
                            color: DESIGN_SYSTEM.content.secondary,
                            marginBottom: `${SPACING.xs}px`
                          }}
                        >
                          <span>{task.progress}/{task.maxProgress}</span>
                          <span style={{ color: categoryColor, fontWeight: TYPOGRAPHY.weights.bold }}>
                            +{task.points} XP
                          </span>
                        </div>
                        <div 
                          className="w-full rounded-full"
                          style={{ 
                            height: '6px',
                            backgroundColor: DESIGN_SYSTEM.neutral.surfaceElevated
                          }}
                        >
                          <div 
                            className="rounded-full transition-all duration-1000 ease-out"
                            style={{ 
                              height: '6px',
                              width: `${progressPercentage}%`,
                              backgroundColor: categoryColor,
                              filter: 'drop-shadow(0 0 4px currentColor)'
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleTaskAction(task.id)}
                    disabled={loading || isCompleted}
                    className="flex items-center transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
                    style={{ 
                      gap: `${SPACING.xs}px`,
                      padding: `${SPACING.sm}px ${SPACING.md}px`,
                      borderRadius: `${RADIUS.sm}px`,
                      backgroundColor: isCompleted 
                        ? DESIGN_SYSTEM.brand.success 
                        : DESIGN_SYSTEM.brand.primary,
                      color: DESIGN_SYSTEM.content.primary,
                      fontSize: TYPOGRAPHY.sizes.caption,
                      fontWeight: TYPOGRAPHY.weights.bold
                    }}
                  >
                    {isCompleted ? (
                      <>
                        <Star size={16} />
                        <span>Done</span>
                      </>
                    ) : loading ? (
                      <span>...</span>
                    ) : (
                      <>
                        <span>Start</span>
                        <ChevronRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const DashboardTab = ({ userScore, onShareProgress, handleViewProfile, loading }: {
  userScore: UserScore,
  onShareProgress: () => void,
  handleViewProfile: () => void,
  loading: boolean
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const handleCategorySelect = useCallback((category: Category) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  }, [selectedCategory]);

  return (
    <div className="flex flex-col" style={{ gap: `${SPACING.xl}px` }}>
      <AppleHeader 
        userScore={userScore}
        onShareProgress={onShareProgress}
        handleViewProfile={handleViewProfile}
        loading={loading}
      />

      <div 
        className="border"
        style={{ 
          backgroundColor: DESIGN_SYSTEM.neutral.surface,
          borderColor: DESIGN_SYSTEM.neutral.border + '40',
          borderWidth: '0.5px',
          borderRadius: `${RADIUS.xl}px`,
          padding: `${SPACING.xl}px`
        }}
      >
        <h2 
          className="text-white text-center"
          style={{ 
            fontSize: TYPOGRAPHY.sizes.title,
            fontWeight: TYPOGRAPHY.weights.bold,
            letterSpacing: TYPOGRAPHY.letterSpacing.title,
            marginBottom: `${SPACING.xl}px`
          }}
        >
          Overview
        </h2>
        <AppleRadarChart 
          userScore={userScore} 
          onCategorySelect={handleCategorySelect}
        />
        
        {selectedCategory && (
          <div 
            className="backdrop-blur-sm border"
            style={{ 
              marginTop: `${SPACING.xl}px`,
              backgroundColor: DESIGN_SYSTEM.neutral.primary + '40',
              borderColor: DESIGN_SYSTEM.neutral.border + '60',
              borderRadius: `${RADIUS.nested(RADIUS.xl, SPACING.md)}px`,
              padding: `${SPACING.md}px`
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center" style={{ gap: `${SPACING.md}px` }}>
                <div 
                  className="flex items-center justify-center shadow-sm"
                  style={{ 
                    width: '40px',
                    height: '40px',
                    borderRadius: `${RADIUS.sm}px`,
                    backgroundColor: DESIGN_SYSTEM.categories[selectedCategory] + '20',
                    border: `1px solid ${DESIGN_SYSTEM.categories[selectedCategory]}`
                  }}
                >
                  {React.createElement(CATEGORY_ICONS[selectedCategory], { 
                    size: 18, 
                    color: DESIGN_SYSTEM.categories[selectedCategory] 
                  })}
                </div>
                <div>
                  <div 
                    className="text-white"
                    style={{ 
                      fontSize: TYPOGRAPHY.sizes.body,
                      fontWeight: TYPOGRAPHY.weights.bold,
                      letterSpacing: TYPOGRAPHY.letterSpacing.body
                    }}
                  >
                    {selectedCategory}
                  </div>
                  <div 
                    style={{ 
                      fontSize: TYPOGRAPHY.sizes.caption,
                      color: DESIGN_SYSTEM.content.secondary,
                      marginTop: '2px'
                    }}
                  >
                    Rank #{userScore.rankings.categories[selectedCategory]}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div 
                  className="text-white font-mono"
                  style={{ 
                    fontSize: TYPOGRAPHY.sizes.title,
                    fontWeight: TYPOGRAPHY.weights.bold,
                    letterSpacing: TYPOGRAPHY.letterSpacing.title
                  }}
                >
                  {userScore.categories[selectedCategory].score.toLocaleString()}
                </div>
                <div 
                  style={{ 
                    fontSize: TYPOGRAPHY.sizes.caption,
                    color: DESIGN_SYSTEM.content.secondary,
                    marginTop: '2px'
                  }}
                >
                  {userScore.categories[selectedCategory].rank}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <AppleProgressRings userScore={userScore} />

      <AppleBadges userScore={userScore} />
    </div>
  );
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
  
  const userFid = context?.user?.fid || 12345;
  const username = context?.user?.username || 'Demo User';
  
  const viewProfile = useViewProfile();

  useEffect(() => {
    const generateEvolution = (): EvolutionData[] => {
      const data: EvolutionData[] = [];
      const today = new Date();
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        
        const baseScore = 800 + (29 - i) * 15;
        const variation = Math.random() * 100 - 50;
        
        data.push({
          date: date.toISOString(),
          totalScore: Math.max(0, baseScore + variation),
          categoryScores: {
            Builder: Math.floor((baseScore + variation) * 0.4),
            Social: Math.floor((baseScore + variation) * 0.3),
            Degen: Math.floor((baseScore + variation) * 0.2),
            Player: Math.floor((baseScore + variation) * 0.1),
          },
          rank: baseScore > 1000 ? 'Plus' : baseScore > 500 ? 'Core' : 'Mini',
          primaryCategory: 'Builder'
        });
      }
      
      return data;
    };

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
      evolution: generateEvolution(),
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
  }, [userFid, username]);

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
    }
  }, [authenticatedUser, signIn, userFid, username]);

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
                  Simulated data • Real data in production
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
