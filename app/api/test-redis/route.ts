import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function GET() {
  try {
    if (!redis) {
      return NextResponse.json(
        { error: 'Redis not configured' },
        { status: 500 }
      );
    }

    await redis.set('test-key', 'Hello Redis!', { ex: 60 });
    
    const value = await redis.get('test-key');
    
    return NextResponse.json({
      success: true,
      message: 'Redis is working!',
      testValue: value,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Redis test error:', error);
    return NextResponse.json(
      { error: 'Redis connection failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
