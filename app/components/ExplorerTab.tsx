"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Search, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { UserScore, Category } from '../../lib/types';
import { DESIGN_SYSTEM, TYPOGRAPHY, SPACING, RADIUS, CATEGORY_ICONS } from '../constants';
import Image from 'next/image';

interface LeaderboardEntry {
  fid: number;
  username: string;
  avatar: string;
  score: number;
  rank: string;
  change: number;
  position: number;
}

interface ExplorerTabProps {
  userScore: UserScore;
}

export const ExplorerTab = ({ userScore }: ExplorerTabProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRankingType, setSelectedRankingType] = useState<'global' | Category>('global');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLeaderboard = useCallback(async (category: string = 'global') => {
    try {
      setLoading(true);
      const response = await fetch(`/api/leaderboard?category=${category}&limit=50`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      
      const data = await response.json();
      
      const currentUserInLeaderboard = data.leaderboard.find((entry: LeaderboardEntry) => entry.fid === userScore.fid);
      
      if (!currentUserInLeaderboard) {
        const userEntry: LeaderboardEntry = {
          fid: userScore.fid,
          username: userScore.username,
          avatar: userScore.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userScore.username}`,
          score: category === 'global' ? userScore.totalScore : userScore.categories[category as Category]?.score || 0,
          rank: category === 'global' ? userScore.categories[userScore.primaryCategory].rank : userScore.categories[category as Category]?.rank || 'Mini',
          change: 2,
          position: category === 'global' ? userScore.rankings.global : userScore.rankings.categories[category as Category] || 999
        };
        
        const updatedLeaderboard = [...data.leaderboard, userEntry].sort((a, b) => b.score - a.score);
        setLeaderboard(updatedLeaderboard.map((entry, index) => ({ ...entry, position: index + 1 })));
      } else {
        setLeaderboard(data.leaderboard);
      }
      
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      
      if (window.location.hostname === 'localhost') {
        const fallbackData = [
          { fid: 3, username: 'dwr.eth', score: 2500, rank: 'ProMax', change: 0, position: 1 },
          { fid: 5650, username: 'vitalik.eth', score: 2200, rank: 'ProMax', change: 1, position: 2 },
          { fid: userScore.fid, username: userScore.username, score: userScore.totalScore, rank: userScore.categories[userScore.primaryCategory].rank, change: 2, position: userScore.rankings.global },
        ].map(entry => ({
          ...entry,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.username}`
        }));
        
        setLeaderboard(fallbackData);
      } else {
        setLeaderboard([]);
      }
    } finally {
      setLoading(false);
    }
  }, [userScore]);

  useEffect(() => {
    fetchLeaderboard(selectedRankingType);
  }, [selectedRankingType, fetchLeaderboard, userScore.fid]);

  const filteredLeaderboard = leaderboard.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 10);

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
            disabled={loading}
            className="transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
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
              disabled={loading}
              className="flex items-center transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
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
        {loading ? (
          <div className="flex items-center justify-center" style={{ padding: `${SPACING.xl}px` }}>
            <div 
              className="animate-spin rounded-full border-b-2"
              style={{ 
                width: '24px',
                height: '24px',
                borderColor: DESIGN_SYSTEM.brand.primary
              }}
            ></div>
          </div>
        ) : (
          <div style={{ gap: `${SPACING.md}px` }} className="flex flex-col">
            {filteredLeaderboard.map((user) => {
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
                      <Image
                        src={user.avatar}
                        alt={user.username}
                        style={{ 
                          width: '40px',
                          height: '40px',
                          borderRadius: `${RADIUS.md}px`
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`;
                        }}
                      />
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
        )}
      </div>
    </div>
  );
};