import { Action } from "@/lib/database";
import { NextResponse } from "next/server";

interface UserUpdate {
  fid: number;
  socialDelta: number;
  builderDelta: number;
  degenDelta: number;
  playerDelta: number;
  newActions: Action[];
}

async function getActiveUsers(): Promise<number[]> {
  return [3, 5650, 1, 239, 2, 12345];
}

async function updateUserScores(updates: UserUpdate[]): Promise<void> {
  console.log('Updating scores for', updates.length, 'users');
  
  updates.forEach(update => {
    console.log(`FID ${update.fid}: +${update.socialDelta} Social, +${update.builderDelta} Builder, +${update.degenDelta} Degen, +${update.playerDelta} Player`);
  });
}

export async function POST() {
  try {
    console.log('🔄 Starting score update worker...');
    
    const activeUsers = await getActiveUsers();
    const updates: UserUpdate[] = [];
    
    for (const fid of activeUsers) {
      try {
        const socialResponse = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/scoring/farcaster`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fid })
        });
        const socialData = await socialResponse.json();
        
        const onchainResponse = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/scoring/onchain`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fid })
        });
        const onchainData = await onchainResponse.json();
        
        const playerResponse = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/scoring/player`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fid })
        });
        const playerData = await playerResponse.json();
        
        updates.push({
          fid,
          socialDelta: socialData.socialScore || 0,
          builderDelta: onchainData.builderScore || 0,
          degenDelta: onchainData.degenScore || 0,
          playerDelta: playerData.playerScore || 0,
          newActions: [
            ...(socialData.actions || []),
            ...(onchainData.actions || []),
            ...(playerData.actions || [])
          ]
        });
        
      } catch (error) {
        console.error(`Error updating FID ${fid}:`, error);
      }
    }
        
    await updateUserScores(updates);
    
    console.log('✅ Score update completed');
    
    return NextResponse.json({
      success: true,
      usersUpdated: updates.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Worker error:', error);
    return NextResponse.json(
      { error: 'Worker failed' },
      { status: 500 }
    );
  }
}
