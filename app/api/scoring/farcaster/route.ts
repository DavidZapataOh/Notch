import { NextResponse } from "next/server";

interface FarcasterData {
  casts: {
    parent_hash: string;
    timestamp: string;
  }[];
  reactions: {
    reaction_type: string;
    timestamp: string;
  }[];
}

const DAILY_LIMITS = {
  Social: 50,
  Builder: 200,
  Degen: 150,
  Player: 100
};

async function fetchFarcasterData(fid: number): Promise<FarcasterData> {
  const apiKey = process.env.NEYNAR_API_KEY;
  if (!apiKey) {
    console.error('❌ NEYNAR_API_KEY not configured');
    return { casts: [], reactions: [] };
  }

  try {
    console.log(`🔍 Fetching Farcaster data for FID ${fid}...`);
    
    const castsResponse = await fetch(
      `https://api.neynar.com/v2/farcaster/casts?fid=${fid}&limit=150`,
      { headers: { 'api_key': apiKey } }
    );
    
    if (!castsResponse.ok) {
      console.error(`❌ Failed to fetch casts: ${castsResponse.status}`);
      return { casts: [], reactions: [] };
    }
    
    const castsData = await castsResponse.json();

    const [likesResponse, recastsResponse] = await Promise.all([
      fetch(
        `https://api.neynar.com/v2/farcaster/reactions?fid=${fid}&reaction_type=like&limit=100`,
        { headers: { 'api_key': apiKey } }
      ),
      fetch(
        `https://api.neynar.com/v2/farcaster/reactions?fid=${fid}&reaction_type=recast&limit=100`,
        { headers: { 'api_key': apiKey } }
      )
    ]);

    const likesData = likesResponse.ok ? await likesResponse.json() : { reactions: [] };
    const recastsData = recastsResponse.ok ? await recastsResponse.json() : { reactions: [] };

    console.log(`✅ Fetched ${castsData.casts?.length || 0} casts, ${likesData.reactions?.length || 0} likes, ${recastsData.reactions?.length || 0} recasts`);

    return {
      casts: castsData.casts || [],
      reactions: [...(likesData.reactions || []), ...(recastsData.reactions || [])]
    };
  } catch (error) {
    console.error('❌ Error fetching Farcaster data:', error);
    return { casts: [], reactions: [] };
  }
}

function calculateSocialScore(data: FarcasterData, lastUpdateTime: string): number {
  const lastUpdate = new Date(lastUpdateTime);
  let totalPoints = 0;

  const newCasts = data.casts.filter(cast => new Date(cast.timestamp) > lastUpdate);
  const newReactions = data.reactions.filter(reaction => new Date(reaction.timestamp) > lastUpdate);

  newCasts.forEach(cast => {
    if (cast.parent_hash) {
      totalPoints += 3;
    } else {
      totalPoints += 5;
    }
  });

  newReactions.forEach(reaction => {
    if (reaction.reaction_type === 'like') {
      totalPoints += 1;
    } else if (reaction.reaction_type === 'recast') {
      totalPoints += 2;
    }
  });

  return Math.min(totalPoints, DAILY_LIMITS.Social);
}

export async function POST(request: Request) {
  try {
    const { fid } = await request.json();
    
    if (!fid) {
      return NextResponse.json({ error: 'FID required' }, { status: 400 });
    }

    const farcasterData = await fetchFarcasterData(fid);
    
    const socialScore = calculateSocialScore(farcasterData, new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
    
    return NextResponse.json({
      fid,
      socialScore,
      actions: farcasterData.casts.length + farcasterData.reactions.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error calculating Farcaster score:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
