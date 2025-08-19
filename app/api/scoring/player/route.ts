import { NextResponse } from "next/server";

async function getUserPlayerData(fid: number) {
  console.log(`🔍 Fetching player data for FID ${fid}...`);
  
  try {
    const { redis } = await import("@/lib/redis");
    
    let consecutiveDays = 0;
    let lastActive = new Date().toISOString();
    
    if (redis) {
      try {
        const userActivityKey = `notch:player:${fid}:activity`;
        const activityData = await redis.get(userActivityKey);
        
        if (activityData) {
          const parsed = JSON.parse(activityData as string);
          consecutiveDays = parsed.consecutiveDays || 0;
          lastActive = parsed.lastActive || new Date().toISOString();
        } else {
          const initialData = {
            consecutiveDays: 1,
            lastActive: new Date().toISOString(),
            firstSeen: new Date().toISOString()
          };
          
          await redis.setex(userActivityKey, 86400 * 30, JSON.stringify(initialData));
          consecutiveDays = 1;
        }
      } catch (error) {
        console.error('❌ Error accessing Redis for player data:', error);
      }
    }
    
    let partnerInteractions = 0;
    
    try {
      const easResponse = await fetch(
        `https://base.easscan.org/graphql`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
              query GetAttestations($recipient: String!) {
                attestations(
                  where: { 
                    recipient: { equals: $recipient }
                    schemaId: { in: ["0x..."] }
                  }
                ) {
                  id
                  attester
                  timeCreated
                  data
                }
              }
            `,
            variables: {
              recipient: `fid:${fid}`
            }
          })
        }
      );
      
      if (easResponse.ok) {
        const easData = await easResponse.json();
        partnerInteractions = easData.data?.attestations?.length || 0;
        console.log(`✅ Found ${partnerInteractions} partner interactions for FID ${fid}`);
      }
    } catch (error) {
      console.error('❌ Error fetching EAS attestations:', error);
    }
    
    let completedMissions = 0;
    
    if (redis) {
      try {
        const missionsKey = `notch:player:${fid}:missions`;
        const missionsData = await redis.get(missionsKey);
        
        if (missionsData) {
          const missions = JSON.parse(missionsData as string);
          completedMissions = missions.completed?.length || 0;
        }
      } catch (error) {
        console.error('❌ Error fetching missions data:', error);
      }
    }
    
    console.log(`✅ Player data for FID ${fid}: ${consecutiveDays} consecutive days, ${partnerInteractions} partner interactions, ${completedMissions} missions`);
    
    return {
      consecutive_days: consecutiveDays,
      last_active: lastActive,
      partner_interactions: partnerInteractions,
      completed_missions: completedMissions
    };
    
  } catch (error) {
    console.error('❌ Error fetching player data:', error);
    return {
      consecutive_days: 0,
      last_active: new Date().toISOString(),
      partner_interactions: 0,
      completed_missions: 0
    };
  }
}

async function updateUserActivity(fid: number) {
  const { redis } = await import("@/lib/redis");
  
  if (!redis) return;
  
  try {
    const userActivityKey = `notch:player:${fid}:activity`;
    const today = new Date().toISOString().split('T')[0];
    
    const activityData = await redis.get(userActivityKey);
    
    if (activityData) {
      const parsed = JSON.parse(activityData as string);
      const lastActiveDate = new Date(parsed.lastActive).toISOString().split('T')[0];
      
      if (lastActiveDate === today) {
        return;
      }
      
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      let newConsecutiveDays;
      if (lastActiveDate === yesterday) {
            newConsecutiveDays = (parsed.consecutiveDays || 0) + 1;
      } else {
        newConsecutiveDays = 1;
      }
      
      const updatedData = {
        ...parsed,
        consecutiveDays: newConsecutiveDays,
        lastActive: new Date().toISOString()
      };
      
      await redis.setex(userActivityKey, 86400 * 30, JSON.stringify(updatedData));
      console.log(`✅ Updated activity for FID ${fid}: ${newConsecutiveDays} consecutive days`);
    }
  } catch (error) {
    console.error('❌ Error updating user activity:', error);
  }
}

function calculatePlayerScore(data: {
  consecutive_days: number;
  partner_interactions: number;
  completed_missions: number;
}): number {
  let score = 0;
  
  score += (data.consecutive_days || 0) * 2;
  
  const weeks = Math.floor((data.consecutive_days || 0) / 7);
  score += weeks * 10;
  
  score += (data.partner_interactions || 0) * 5;
  
  score += (data.completed_missions || 0) * 30;
  
  return Math.min(score, 100);
}

export async function POST(request: Request) {
  try {
    const { fid, updateActivity } = await request.json();
    
    if (!fid) {
      return NextResponse.json({ error: 'FID required' }, { status: 400 });
    }

    if (updateActivity) {
      await updateUserActivity(fid);
    }

    const playerData = await getUserPlayerData(fid);
    const playerScore = calculatePlayerScore(playerData);
    
    return NextResponse.json({
      fid,
      playerScore,
      playerData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error calculating player score:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { fid } = await request.json();
    
    if (!fid) {
      return NextResponse.json({ error: 'FID required' }, { status: 400 });
    }

    await updateUserActivity(fid);
    
    return NextResponse.json({
      success: true,
      message: 'Activity updated',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error updating activity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
