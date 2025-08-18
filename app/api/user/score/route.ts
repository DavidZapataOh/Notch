import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

interface FarcasterProfile {
  fid: number;
  username: string;
  pfp_url?: string;
  follower_count?: number;
  following_count?: number;
  verified_addresses?: string[];
}

interface ScoreData {
  fid: number;
  username: string;
  avatar: string;
  totalScore: number;
  categories: {
    Builder: { score: number; rank: string; level: number; progress: number };
    Social: { score: number; rank: string; level: number; progress: number };
    Degen: { score: number; rank: string; level: number; progress: number };
    Player: { score: number; rank: string; level: number; progress: number };
  };
  primaryCategory: string;
  badges: string[];
  season: number;
  lastUpdated: string;
  rankings: {
    global: number;
    categories: {
      Builder: number;
      Social: number;
      Degen: number;
      Player: number;
    };
  };
  totalUsers: number;
}

const RANK_THRESHOLDS = {
  Mini: 0,
  Core: 100,
  Plus: 300,
  Pro: 600,
  ProMax: 1000,
};

function calculateRank(score: number): string {
  if (score >= RANK_THRESHOLDS.ProMax) return 'ProMax';
  if (score >= RANK_THRESHOLDS.Pro) return 'Pro';
  if (score >= RANK_THRESHOLDS.Plus) return 'Plus';
  if (score >= RANK_THRESHOLDS.Core) return 'Core';
  return 'Mini';
}

function calculateLevel(score: number): number {
  return Math.floor(score / 50) + 1;
}

function calculateProgress(score: number): number {
  const currentRank = calculateRank(score);
  const rankKeys = Object.keys(RANK_THRESHOLDS) as (keyof typeof RANK_THRESHOLDS)[];
  const currentRankIndex = rankKeys.indexOf(currentRank as keyof typeof RANK_THRESHOLDS);
  
  if (currentRankIndex === rankKeys.length - 1) return 100;
  
  const currentThreshold = RANK_THRESHOLDS[currentRank as keyof typeof RANK_THRESHOLDS];
  const nextRank = rankKeys[currentRankIndex + 1];
  const nextThreshold = RANK_THRESHOLDS[nextRank];
  
  const progress = ((score - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  return Math.min(Math.max(progress, 0), 100);
}

async function fetchFarcasterProfile(fid: number): Promise<FarcasterProfile | null> {
  try {
    const response = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`, {
      headers: {
        'api_key': process.env.NEYNAR_API_KEY || '',
      },
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const user = data.users?.[0];
    
    if (!user) return null;
    
    return {
      fid: user.fid,
      username: user.username,
      pfp_url: user.pfp_url,
      follower_count: user.follower_count,
      following_count: user.following_count,
      verified_addresses: user.verified_addresses?.eth_addresses || [],
    };
  } catch (error) {
    console.error('Error fetching Farcaster profile:', error);
    return null;
  }
}

async function calculateUserScore(profile: FarcasterProfile): Promise<ScoreData> {
  const fid = profile.fid;
  
  const socialScore = Math.min(
    Math.floor((profile.follower_count || 0) * 0.1) + 
    Math.floor((profile.following_count || 0) * 0.05),
    500
  );
  
  const builderScore = (profile.verified_addresses?.length || 0) * 50;
  
  const degenScore = Math.floor(Math.random() * 200);
  
  const playerScore = Math.floor(Math.random() * 150);
  
  const totalScore = socialScore + builderScore + degenScore + playerScore;
  
  const scores = { Social: socialScore, Builder: builderScore, Degen: degenScore, Player: playerScore };
  const primaryCategory = Object.entries(scores).reduce((a, b) => scores[a[0] as keyof typeof scores] > scores[b[0] as keyof typeof scores] ? a : b)[0];
  
  return {
    fid,
    username: profile.username,
    avatar: profile.pfp_url || '',
    totalScore,
    categories: {
      Builder: {
        score: builderScore,
        rank: calculateRank(builderScore),
        level: calculateLevel(builderScore),
        progress: calculateProgress(builderScore),
      },
      Social: {
        score: socialScore,
        rank: calculateRank(socialScore),
        level: calculateLevel(socialScore),
        progress: calculateProgress(socialScore),
      },
      Degen: {
        score: degenScore,
        rank: calculateRank(degenScore),
        level: calculateLevel(degenScore),
        progress: calculateProgress(degenScore),
      },
      Player: {
        score: playerScore,
        rank: calculateRank(playerScore),
        level: calculateLevel(playerScore),
        progress: calculateProgress(playerScore),
      },
    },
    primaryCategory,
    badges: [],
    season: 1,
    lastUpdated: new Date().toISOString(),
    rankings: {
      global: await calculateGlobalRanking(fid, totalScore),
      categories: {
        Builder: await calculateCategoryRanking(fid, 'Builder', builderScore),
        Social: await calculateCategoryRanking(fid, 'Social', socialScore),
        Degen: await calculateCategoryRanking(fid, 'Degen', degenScore),
        Player: await calculateCategoryRanking(fid, 'Player', playerScore),
      },
    },
    totalUsers: await getTotalUsers(),
  };
}

async function calculateGlobalRanking(fid: number, score: number): Promise<number> {
  const maxScore = 2000;
  const normalizedScore = Math.min(score / maxScore, 1);
  return Math.max(1, Math.floor((1 - normalizedScore) * 1000));
}

async function calculateCategoryRanking(fid: number, category: string, score: number): Promise<number> {
  const maxScore = 500;
  const normalizedScore = Math.min(score / maxScore, 1);
  return Math.max(1, Math.floor((1 - normalizedScore) * 100));
}

async function getTotalUsers(): Promise<number> {
  return 1547;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fid = searchParams.get('fid');
    
    if (!fid) {
      return NextResponse.json(
        { error: 'FID is required' },
        { status: 400 }
      );
    }
    
    const fidNumber = parseInt(fid);
    if (isNaN(fidNumber)) {
      return NextResponse.json(
        { error: 'Invalid FID' },
        { status: 400 }
      );
    }
    
    const cacheKey = `notch:score:${fidNumber}`;
    
    if (redis) {
      try {
        const cachedScore = await redis.get(cacheKey);
        if (cachedScore) {
          console.log(`✅ CACHE HIT para FID ${fidNumber} - Datos servidos desde Redis`);
          return NextResponse.json(JSON.parse(cachedScore as string));
        }
        console.log(`❌ CACHE MISS para FID ${fidNumber} - Calculando datos...`);
      } catch (cacheError) {
        console.warn('⚠️ Error al leer cache:', cacheError);
      }
    } else {
      console.log('⚠️ Redis no configurado - Sin cache');
    }
    
    console.log(`🔍 Obteniendo perfil de Farcaster para FID ${fidNumber}...`);
    const profile = await fetchFarcasterProfile(fidNumber);
    
    if (!profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    console.log(`🧮 Calculando puntuación para ${profile.username}...`);
    const scoreData = await calculateUserScore(profile);
    
    if (redis) {
      try {
        await redis.setex(cacheKey, 300, JSON.stringify(scoreData));
        console.log(`💾 Datos guardados en cache para FID ${fidNumber} por 5 minutos`);
      } catch (cacheError) {
        console.warn('⚠️ Error al guardar en cache:', cacheError);  
      }
    }
    
    return NextResponse.json(scoreData);
    
  } catch (error) {
    console.error('💥 Error calculating user score:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
