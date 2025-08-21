import { NextRequest, NextResponse } from 'next/server';
import { easClient } from '@/lib/eas-client';
import { scoringEngine } from '@/lib/scoring-engine';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fid = searchParams.get('fid');

    if (!fid) {
      return NextResponse.json(
        { error: 'FID parameter is required' },
        { status: 400 }
      );
    }

    const userFid = parseInt(fid);
    
    const userScore = await scoringEngine.getUserScore(userFid);
    
    if (!userScore) {
      return NextResponse.json(
        { error: 'User score not found' },
        { status: 404 }
      );
    }

    const [userBadges, completedTasks, activityLog] = await Promise.all([
      easClient.getUserBadges(userFid),
      easClient.getUserTaskCompletions(userFid),
      easClient.getUserActivityLog(userFid, 50)
    ]);

    const globalLeaderboard = await easClient.getGlobalLeaderboard(1000);
    const userRanking = globalLeaderboard.findIndex(score => score.fid === userFid) + 1;

    const categoryRankings = {
      Builder: 0,
      Social: 0,
      Degen: 0,
      Player: 0
    };

    for (const category of ['Builder', 'Social', 'Degen', 'Player'] as const) {
      const categoryLeaderboard = await easClient.getCategoryLeaderboard(category, 1000);
      const categoryRanking = categoryLeaderboard.findIndex(score => score.fid === userFid) + 1;
      categoryRankings[category] = categoryRanking;
    }

    const evolutionData = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      const dayActivities = activityLog.filter(activity => {
        const activityDate = new Date(activity.timestamp);
        return activityDate.toDateString() === date.toDateString();
      });

      const activitiesBeforeDay = activityLog.filter(activity => {
        const activityDate = new Date(activity.timestamp);
        return activityDate <= date;
      });

      const totalScore = activitiesBeforeDay.reduce((sum, activity) => sum + activity.points, 0);
      
      const categoryScores = {
        Builder: activitiesBeforeDay
          .filter(activity => activity.category === 'Builder')
          .reduce((sum, activity) => sum + activity.points, 0),
        Social: activitiesBeforeDay
          .filter(activity => activity.category === 'Social')
          .reduce((sum, activity) => sum + activity.points, 0),
        Degen: activitiesBeforeDay
          .filter(activity => activity.category === 'Degen')
          .reduce((sum, activity) => sum + activity.points, 0),
        Player: activitiesBeforeDay
          .filter(activity => activity.category === 'Player')
          .reduce((sum, activity) => sum + activity.points, 0),
      };

      evolutionData.push({
        date: date.toISOString(),
        totalScore,
        categoryScores,
        rank: userScore.rank,
        primaryCategory: Object.entries(categoryScores).reduce((a, b) => 
          categoryScores[a[0] as keyof typeof categoryScores] > categoryScores[b[0] as keyof typeof categoryScores] ? a : b
        )[0] as any
      });
    }

    const primaryCategory = Object.entries(userScore.categoryScores).reduce((a, b) => 
      userScore.categoryScores[a[0] as keyof typeof userScore.categoryScores] > userScore.categoryScores[b[0] as keyof typeof userScore.categoryScores] ? a : b
    )[0] as any;

    const response = {
      fid: userScore.fid,
      username: `@fid${userScore.fid}`, 
      avatar: '', 
      totalScore: userScore.totalScore,
      categories: {
        Builder: {
          score: userScore.categoryScores.Builder,
          rank: userScore.rank,
          level: userScore.level,
          progress: ((userScore.categoryScores.Builder % 100) / 100) * 100
        },
        Social: {
          score: userScore.categoryScores.Social,
          rank: userScore.rank,
          level: userScore.level,
          progress: ((userScore.categoryScores.Social % 100) / 100) * 100
        },
        Degen: {
          score: userScore.categoryScores.Degen,
          rank: userScore.rank,
          level: userScore.level,
          progress: ((userScore.categoryScores.Degen % 100) / 100) * 100
        },
        Player: {
          score: userScore.categoryScores.Player,
          rank: userScore.rank,
          level: userScore.level,
          progress: ((userScore.categoryScores.Player % 100) / 100) * 100
        }
      },
      primaryCategory,
      badges: userBadges.map(badge => ({
        id: badge.badgeId,
        name: badge.badgeName,
        description: '',
        category: badge.category,
        rank: badge.rank,
        earnedAt: badge.earnedAt,
        imageUrl: ''
      })),
      season: userScore.season,
      lastUpdated: userScore.lastUpdated,
      evolution: evolutionData,
      rankings: {
        global: userRanking,
        categories: categoryRankings
      },
      totalUsers: globalLeaderboard.length,
      completedTasks: completedTasks.length,
      recentActivities: activityLog.slice(0, 10)
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching user score:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
