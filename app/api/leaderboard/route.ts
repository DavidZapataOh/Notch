import { NextRequest, NextResponse } from 'next/server';
import { easClient } from '@/lib/eas-client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '100');

    let leaderboardData;

    if (category && ['Builder', 'Social', 'Degen', 'Player'].includes(category)) {
      // Obtener leaderboard por categoría
      const categoryLeaderboard = await easClient.getCategoryLeaderboard(category, limit);
      
      leaderboardData = categoryLeaderboard.map((score, index) => ({
        position: index + 1,
        fid: score.fid,
        username: `@fid${score.fid}`, // Esto se puede mejorar con datos de Farcaster
        avatar: '', // Esto se puede obtener de Farcaster
        score: score.categoryScores[category as keyof typeof score.categoryScores],
        rank: score.rank,
        level: score.level,
        category: category
      }));
    } else {
      // Obtener leaderboard global
      const globalLeaderboard = await easClient.getGlobalLeaderboard(limit);
      
      leaderboardData = globalLeaderboard.map((score, index) => ({
        position: index + 1,
        fid: score.fid,
        username: `@fid${score.fid}`, // Esto se puede mejorar con datos de Farcaster
        avatar: '', // Esto se puede obtener de Farcaster
        score: score.totalScore,
        rank: score.rank,
        level: score.level,
        category: 'Global'
      }));
    }

    return NextResponse.json({
      leaderboard: leaderboardData,
      category: category || 'Global',
      total: leaderboardData.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
