import { NextResponse } from "next/server";

interface Season {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  daysRemaining: number;
}

export async function GET() {
  try {
    const now = new Date();
    
    const seasonDuration = 30 * 24 * 60 * 60 * 1000;
    const firstSeasonStart = new Date('2025-08-18').getTime();
    
    const timeSinceFirst = now.getTime() - firstSeasonStart;
    const currentSeasonNumber = Math.floor(timeSinceFirst / seasonDuration) + 1;
    
    const currentSeasonStart = new Date(firstSeasonStart + (currentSeasonNumber - 1) * seasonDuration);
    const currentSeasonEnd = new Date(firstSeasonStart + currentSeasonNumber * seasonDuration);
    
    const daysRemaining = Math.ceil((currentSeasonEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    
    const currentSeason: Season = {
      id: currentSeasonNumber,
      name: `Season ${currentSeasonNumber}`,
      startDate: currentSeasonStart.toISOString(),
      endDate: currentSeasonEnd.toISOString(),
      isActive: true,
      daysRemaining: Math.max(0, daysRemaining)
    };
    
    return NextResponse.json(currentSeason);
    
  } catch (error) {
    console.error('Error fetching season:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
