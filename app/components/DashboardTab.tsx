"use client";

import React, { useState, useCallback } from 'react';
import { UserScore, Category } from '../../lib/types';
import { getNextRank, RANK_THRESHOLDS } from '../../lib/scoring';
import { Target, Award, Star, Activity, Users, TrendingUp } from 'lucide-react';
import { DESIGN_SYSTEM, TYPOGRAPHY, SPACING, RADIUS, CATEGORY_ICONS } from '../constants';
import { AppleHeader } from './SharedComponents';
import { AppleRadarChart } from './RadarChart';

export const AppleProgressRings = ({ userScore }: { userScore: UserScore }) => {
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

export const AppleBadges = ({ }: { userScore: UserScore }) => {
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

interface DashboardTabProps {
  userScore: UserScore;
  onShareProgress: () => void;
  handleViewProfile: () => void;
  loading: boolean;
}

export const DashboardTab = ({ userScore, onShareProgress, handleViewProfile, loading }: DashboardTabProps) => {
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
        <h3 
          className="text-white flex items-center"
          style={{ 
            fontSize: TYPOGRAPHY.sizes.title,
            fontWeight: TYPOGRAPHY.weights.bold,
            letterSpacing: TYPOGRAPHY.letterSpacing.title,
            gap: `${SPACING.sm}px`,
            marginBottom: `${SPACING.xs}px`
          }}
        >
          <TrendingUp size={20} />
          <span>Overview</span>
        </h3>
        
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