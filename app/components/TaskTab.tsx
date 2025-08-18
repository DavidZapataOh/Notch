"use client";

import React, { useState } from 'react';
import { Calendar, Star, ChevronRight } from 'lucide-react';
import { UserScore, Category } from '../../lib/types';
import { AuthenticatedUser } from '../constants';
import { DESIGN_SYSTEM, TYPOGRAPHY, SPACING, RADIUS, CATEGORY_ICONS } from '../constants';
import { EmotionalFeedback } from './SharedComponents';

interface TasksTabProps {
  userScore: UserScore;
  onProtectedAction: (actionId: string) => void;
  loading: boolean;
  authenticatedUser: AuthenticatedUser | null;
}

export const TasksTab = ({ userScore, onProtectedAction, loading, authenticatedUser }: TasksTabProps) => {
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