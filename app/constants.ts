import { Category } from '../lib/types';
import { 
  Activity, 
  Users, 
  TrendingUp, 
  Gamepad2,
  LucideIcon
} from 'lucide-react';

export interface AuthenticatedUser {
  fid: number;
  username: string;
  authenticated: boolean;
}

export type TabType = 'dashboard' | 'explorer' | 'tasks';

export const DESIGN_SYSTEM = {
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

export const TYPOGRAPHY = {
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

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  nested: (outer: number, gap: number) => outer - gap
};

export const CATEGORY_ICONS: Record<Category, LucideIcon> = {
  Builder: Activity,
  Social: Users,
  Degen: TrendingUp,
  Player: Gamepad2
};