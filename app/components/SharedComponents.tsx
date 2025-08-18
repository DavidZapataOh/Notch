"use client";

import React, { useEffect } from 'react';
import { Share2 } from 'lucide-react';
import { UserScore } from '../../lib/types';
import { DESIGN_SYSTEM, TYPOGRAPHY, SPACING, RADIUS } from '../constants';
import Image from 'next/image';

export const EmotionalFeedback = ({ 
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

export const AppleHeader = ({ userScore, onShareProgress, handleViewProfile, loading }: {
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
          {userScore.avatar ? (
            <Image
              src={userScore.avatar}
              alt={userScore.username}
              width={64}
              height={64}
              className="cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg object-cover"
              style={{ 
                width: '64px',
                height: '64px',
                borderRadius: `${RADIUS.lg}px`
              }}
              onClick={handleViewProfile}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className="bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
            style={{ 
              width: '64px',
              height: '64px',
              borderRadius: `${RADIUS.lg}px`,
              display: userScore.avatar ? 'none' : 'flex'
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
              {userScore.username.charAt(0)?.toUpperCase() || 'U'}
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
              {/* {currentSeason?.daysRemaining && (
                <>
                  <div 
                    className="rounded-full"
                    style={{ 
                      width: '3px', 
                      height: '3px',
                      backgroundColor: DESIGN_SYSTEM.content.tertiary
                    }}
                  ></div>
                  <span>{currentSeason.daysRemaining}d left</span>
                </>
              )} */}
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
            className="text-white"
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