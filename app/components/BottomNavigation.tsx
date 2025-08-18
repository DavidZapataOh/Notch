"use client";

import React, { useState } from 'react';
import { Home, Search, CheckSquare } from 'lucide-react';
import { TabType, DESIGN_SYSTEM, TYPOGRAPHY, SPACING, RADIUS } from '../constants';

interface BottomNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
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