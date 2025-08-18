import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

interface LeaderboardEntry {
  fid: number;
  username: string;
  avatar: string;
  score: number;
  rank: string;
  change: number;
  position: number;
}

const SAMPLE_LEADERBOARD = [
  { fid: 3, username: 'dwr.eth', score: 2500, rank: 'ProMax', change: 0 },
  { fid: 5650, username: 'vitalik.eth', score: 2200, rank: 'ProMax', change: 1 },
  { fid: 1, username: 'farcaster', score: 1800, rank: 'Pro', change: -1 },
  { fid: 239, username: 'jessepollak', score: 1600, rank: 'Pro', change: 2 },
  { fid: 2, username: 'v', score: 1400, rank: 'Pro', change: 0 },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'global';
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const leaderboard: LeaderboardEntry[] = SAMPLE_LEADERBOARD.map((entry, index) => ({
      ...entry,
      position: index + 1,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.username}`,
    }));
    
    return NextResponse.json({
      category,
      leaderboard: leaderboard.slice(0, limit),
      totalUsers: 1547,
      lastUpdated: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
