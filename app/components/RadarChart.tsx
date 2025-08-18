"use client";

import React, { useState } from 'react';
import { UserScore, Category } from '../../lib/types';
import { DESIGN_SYSTEM, TYPOGRAPHY, SPACING, RADIUS, CATEGORY_ICONS } from '../constants';

interface RadarChartProps {
  userScore: UserScore;
  onCategorySelect: (category: Category) => void;
}

export const AppleRadarChart = ({ userScore, onCategorySelect }: RadarChartProps) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<Category | null>(null);
  
  const categories = Object.keys(userScore.categories) as Category[];
  const centerX = 175;
  const centerY = 175;
  const maxRadius = 80;
  const minRadius = 40;
  
  const getPointPosition = (index: number, progress: number) => {
    const angle = (index * 2 * Math.PI) / categories.length - Math.PI / 2;
    const radius = minRadius + (progress / 100) * (maxRadius - minRadius);
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  };

  const getLabelPosition = (index: number) => {
    const angle = (index * 2 * Math.PI) / categories.length - Math.PI / 2;
    const labelRadius = maxRadius + 45;
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
    <div className="relative w-full flex items-center justify-center" style={{ height: '380px' }}>
      <div className="relative">
        <svg width="350" height="350" className="overflow-visible">
          {[0.25, 0.5, 0.75, 1].map((scale, i) => {
            const radius = minRadius + (maxRadius - minRadius) * scale;
            return (
              <circle
                key={i}
                cx={centerX}
                cy={centerY}
                r={radius}
                fill="none"
                stroke={DESIGN_SYSTEM.neutral.border}
                strokeWidth="0.5"
                opacity="0.8"
              />
            );
          })}

          {categories.map((_, index) => {
            const angle = (index * 2 * Math.PI) / categories.length - Math.PI / 2;
            const endX = centerX + maxRadius * Math.cos(angle);
            const endY = centerY + maxRadius * Math.sin(angle);
            return (
              <line
                key={index}
                x1={centerX}
                y1={centerY}
                x2={endX}
                y2={endY}
                stroke={DESIGN_SYSTEM.neutral.border}
                strokeWidth="0.5"
                opacity="0.8"
              />
            );
          })}

          <path
            d={userAreaPath}
            fill={DESIGN_SYSTEM.brand.primary + '20'}
            stroke={DESIGN_SYSTEM.brand.primary}
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {userPoints.map((point, index) => {
            const category = categories[index];
            const isHovered = hoveredCategory === category;
            const isSelected = selectedCategory === category;
            
            return (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r={isSelected ? "6" : isHovered ? "5" : "4"}
                fill={DESIGN_SYSTEM.categories[category]}
                stroke={DESIGN_SYSTEM.neutral.primary}
                strokeWidth="2"
                className="transition-all duration-200"
                style={{
                  filter: isHovered ? `drop-shadow(0 0 8px ${DESIGN_SYSTEM.categories[category]}80)` : 'none'
                }}
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
                left: labelPos.x - 40,
                top: labelPos.y - 35,
                width: '80px',
                transform: 'none'
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
                  padding: `${SPACING.xs}px`,
                  borderRadius: `${RADIUS.md}px`,
                  backgroundColor: isSelected 
                    ? DESIGN_SYSTEM.categories[category] + '20'
                    : isHovered 
                    ? DESIGN_SYSTEM.categories[category] + '10'
                    : 'transparent',
                  border: isSelected ? `1px solid ${DESIGN_SYSTEM.categories[category]}80` : 'none',
                  transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                  opacity: isSelected ? 1 : isHovered ? 1 : 0.8
                }}
              >
                <div 
                  className="shadow-lg transition-all duration-200"
                  style={{ 
                    width: '32px',
                    height: '32px',
                    borderRadius: `${RADIUS.sm}px`,
                    backgroundColor: DESIGN_SYSTEM.categories[category] + (isSelected ? '30' : isHovered ? '25' : '15'),
                    border: `2px solid ${DESIGN_SYSTEM.categories[category]}${isHovered ? 'FF' : 'CC'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <IconComponent 
                    size={16}
                    color={DESIGN_SYSTEM.categories[category]}
                  />
                </div>
                <div className="text-center" style={{ marginTop: `${SPACING.xs}px` }}>
                  <div 
                    className="text-white"
                    style={{ 
                      fontSize: '11px',
                      fontWeight: TYPOGRAPHY.weights.bold,
                      letterSpacing: TYPOGRAPHY.letterSpacing.caption
                    }}
                  >
                    {category}
                  </div>
                  <div 
                    style={{ 
                      fontSize: '9px',
                      color: DESIGN_SYSTEM.content.secondary,
                      marginTop: '1px'
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

      <div 
        className="absolute pointer-events-none"
        style={{ 
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        <div 
          className="text-center backdrop-blur-lg shadow-2xl border"
          style={{ 
            backgroundColor: DESIGN_SYSTEM.neutral.primary + 'F8',
            borderColor: DESIGN_SYSTEM.neutral.border + '80',
            borderRadius: `${RADIUS.sm}px`,
            padding: `${SPACING.xs}px ${SPACING.sm}px`,
            minWidth: '65px'
          }}
        >
          <div 
            className="text-white font-mono"
            style={{ 
              fontSize: '13px',
              fontWeight: TYPOGRAPHY.weights.bold,
              letterSpacing: TYPOGRAPHY.letterSpacing.body
            }}
          >
            {userScore.totalScore.toLocaleString()}
          </div>
          <div 
            style={{ 
              fontSize: '8px',
              color: DESIGN_SYSTEM.content.secondary,
              fontWeight: TYPOGRAPHY.weights.regular,
              marginTop: '1px'
            }}
          >
            XP
          </div>
        </div>
      </div>
    </div>
  );
};