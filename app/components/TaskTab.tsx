"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Star, ChevronRight, Clock } from 'lucide-react';
import { UserScore, Category } from '../../lib/types';
import { AuthenticatedUser } from '../constants';
import { DESIGN_SYSTEM, TYPOGRAPHY, SPACING, RADIUS, CATEGORY_ICONS } from '../constants';
import { EmotionalFeedback } from './SharedComponents';

interface Task {
  id: string;
  title: string;
  description: string;
  category: Category;
  points: number;
  startDate: string;
  endDate: string;
  verificationMethod: string;
  active: boolean;
}

interface TasksTabProps {
  userScore: UserScore;
  onProtectedAction: (actionId: string) => void;
  loading: boolean;
  authenticatedUser: AuthenticatedUser | null;
}

export const TasksTab = ({ userScore, onProtectedAction, loading, authenticatedUser }: TasksTabProps) => {
  const [completedTask, setCompletedTask] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [verifyingTask, setVerifyingTask] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks || []);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoadingTasks(false);
    }
  }, []);

  const fetchCompletedTasks = useCallback(async () => {
    if (!userScore.fid) return;
    
    // En una implementación real, esto vendría de tu API
    // Por ahora simulamos que no hay tareas completadas
    setCompletedTasks([]);
  }, [userScore.fid]);

  useEffect(() => {
    fetchTasks();
    fetchCompletedTasks();
  }, [fetchTasks, fetchCompletedTasks]);

  const handleTaskAction = async (taskId: string) => {
    if (!authenticatedUser) {
      onProtectedAction(taskId);
      return;
    }

    setVerifyingTask(taskId);
    
    try {
      const response = await fetch('/api/tasks/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fid: userScore.fid, 
          taskId 
        })
      });

      const result = await response.json();

      if (result.success) {
        setCompletedTask(taskId);
        setCompletedTasks(prev => [...prev, taskId]);
        setTimeout(() => setCompletedTask(null), 2000);
        
        // Refrescar puntuación del usuario
        setTimeout(() => {
          window.location.reload();
        }, 2500);
      } else {
        alert(result.message || 'Task requirements not met. Please try again.');
      }

    } catch (error) {
      console.error('Error verifying task:', error);
      alert('Error verifying task. Please try again.');
    } finally {
      setVerifyingTask(null);
    }
  };

  const getTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <div style={{ gap: `${SPACING.xl}px` }} className="flex flex-col">
      <EmotionalFeedback 
        show={!!completedTask}
        type="achievement"
        message="Task Completed! +XP"
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
            {completedTasks.length}/{tasks.length}
          </div>
          <div 
            style={{ 
              fontSize: TYPOGRAPHY.sizes.caption,
              color: DESIGN_SYSTEM.content.secondary,
              marginTop: `${SPACING.xs}px`
            }}
          >
            Tasks Completed
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
            Special Tasks
          </h2>
        </div>
        
        {loadingTasks ? (
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
            {tasks.map((task) => {
              const IconComponent = CATEGORY_ICONS[task.category];
              const categoryColor = DESIGN_SYSTEM.categories[task.category];
              const isCompleted = completedTasks.includes(task.id);
              const isVerifying = verifyingTask === task.id;
              const timeRemaining = getTimeRemaining(task.endDate);
              const isExpired = timeRemaining === 'Expired';
              
              return (
                <div
                  key={task.id}
                  className="transition-all duration-200 hover:scale-102"
                  style={{ 
                    padding: `${SPACING.md}px`,
                    borderRadius: `${RADIUS.md}px`,
                    backgroundColor: isCompleted 
                      ? DESIGN_SYSTEM.brand.success + '15' 
                      : isExpired
                      ? DESIGN_SYSTEM.neutral.surfaceElevated + '80'
                      : DESIGN_SYSTEM.neutral.surfaceElevated,
                    border: isCompleted 
                      ? `1px solid ${DESIGN_SYSTEM.brand.success}40` 
                      : `1px solid ${DESIGN_SYSTEM.neutral.border}40`,
                    opacity: isExpired ? 0.6 : 1
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
                        
                        <div className="flex items-center justify-between" style={{ marginTop: `${SPACING.sm}px` }}>
                          <div className="flex items-center" style={{ gap: `${SPACING.sm}px` }}>
                            <span 
                              style={{ 
                                fontSize: '10px',
                                color: categoryColor,
                                fontWeight: TYPOGRAPHY.weights.bold
                              }}
                            >
                              +{task.points} XP
                            </span>
                          </div>
                          
                          <div className="flex items-center" style={{ gap: `${SPACING.xs}px` }}>
                            <Clock size={12} color={DESIGN_SYSTEM.content.secondary} />
                            <span 
                              style={{ 
                                fontSize: '10px',
                                color: isExpired ? DESIGN_SYSTEM.brand.error : DESIGN_SYSTEM.content.secondary
                              }}
                            >
                              {timeRemaining}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleTaskAction(task.id)}
                      disabled={loading || isCompleted || isVerifying || isExpired}
                      className="flex items-center transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
                      style={{ 
                        gap: `${SPACING.xs}px`,
                        padding: `${SPACING.sm}px ${SPACING.md}px`,
                        borderRadius: `${RADIUS.sm}px`,
                        backgroundColor: isCompleted 
                          ? DESIGN_SYSTEM.brand.success 
                          : isExpired
                          ? DESIGN_SYSTEM.content.tertiary
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
                      ) : isVerifying ? (
                        <span>Verifying...</span>
                      ) : isExpired ? (
                        <span>Expired</span>
                      ) : (
                        <>
                          <span>Verify</span>
                          <ChevronRight size={16} />
                        </>
                      )}
                    </button>
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