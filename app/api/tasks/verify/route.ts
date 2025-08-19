import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

async function verifyFarcasterTask(fid: number, config: Record<string, unknown>): Promise<boolean> {
  const apiKey = process.env.NEYNAR_API_KEY;
  if (!apiKey) return false;

  try {
    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/casts?fid=${fid}&limit=50`,
      { headers: { 'api_key': apiKey } }
    );

    if (!response.ok) return false;

    const data = await response.json();
    const casts = data.casts || [];

    const recentCasts = casts.filter((cast: { timestamp: string; }) => {
      const castDate = new Date(cast.timestamp);
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return castDate > yesterday;
    });

    return recentCasts.some((cast: { text: string | undefined; }) => {
      const text = cast.text?.toLowerCase() || '';
      return (config.keywords as string[]).some((keyword: string) => 
        text.includes(keyword.toLowerCase())
      ) && text.length >= (config.minLength as number || 0);
    });

  } catch (error) {
    console.error('Error verifying Farcaster task:', error);
    return false;
  }
}

async function verifyOnchainTask(fid: number, config: Record<string, unknown>): Promise<boolean> {
  const neynarKey = process.env.NEYNAR_API_KEY;
  const alchemyKey = process.env.ALCHEMY_API_KEY;
  
  if (!neynarKey || !alchemyKey) return false;

  try {
    const userResponse = await fetch(
      `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`,
      { headers: { 'api_key': neynarKey } }
    );

    if (!userResponse.ok) return false;

    const userData = await userResponse.json();
    const addresses = userData.users?.[0]?.verified_addresses?.eth_addresses || [];

    if (addresses.length === 0) return false;

    for (const address of addresses) {
      const txResponse = await fetch(
        `https://base-mainnet.g.alchemy.com/v2/${alchemyKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'alchemy_getAssetTransfers',
            params: [{
              fromAddress: address,
              category: ['external', 'internal'],
              maxCount: 20
            }],
            id: 1
          })
        }
      );

      if (txResponse.ok) {
        const txData = await txResponse.json();
        const recentTxs = txData.result?.transfers || [];

        if (config.eventType === 'contract_creation') {
          const contractCreations = recentTxs.filter((tx: { to: string | null; }) => !tx.to);
          if (contractCreations.length > 0) return true;
        }

        if (config.eventType === 'token_swap') {
          const swaps = recentTxs.filter((tx: { value: number; }) => 
            tx.value > (config.minValue as number || 0)
          );
          if (swaps.length > 0) return true;
        }
      }
    }

    return false;

  } catch (error) {
    console.error('Error verifying onchain task:', error);
    return false;
  }
}

async function verifyEASTask(fid: number, config: Record<string, unknown>): Promise<boolean> {
  try {
    const easResponse = await fetch(
      `https://base.easscan.org/graphql`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query GetRecentAttestations($recipient: String!, $schemaIds: [String!]!) {
              attestations(
                where: { 
                  recipient: { equals: $recipient }
                  schemaId: { in: $schemaIds }
                  timeCreated: { gte: "${Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000)}" }
                }
              ) {
                id
                timeCreated
              }
            }
          `,
          variables: {
            recipient: `fid:${fid}`,
            schemaIds: config.schemaIds
          }
        })
      }
    );

    if (!easResponse.ok) return false;

    const easData = await easResponse.json();
    const attestations = easData.data?.attestations || [];

    return attestations.length >= (config.minAttestations || 1);

  } catch (error) {
    console.error('Error verifying EAS task:', error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const { fid, taskId } = await request.json();
    
    if (!fid || !taskId) {
      return NextResponse.json({ error: 'FID and taskId required' }, { status: 400 });
    }

    if (redis) {
      const completedKey = `notch:tasks:${fid}:completed`;
      const completedTasks = await redis.get(completedKey);
      const completed = completedTasks ? JSON.parse(completedTasks as string) : [];
      
      if (completed.includes(taskId)) {
        return NextResponse.json({ 
          success: false, 
          message: 'Task already completed' 
        });
      }
    }

    const tasksResponse = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/tasks`);
    const tasksData = await tasksResponse.json();
    const task = tasksData.tasks.find((t: { id: string; }) => t.id === taskId);

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    let verified = false;
    
    switch (task.verificationMethod) {
      case 'farcaster_api':
        verified = await verifyFarcasterTask(fid, task.verificationConfig);
        break;
      case 'onchain':
        verified = await verifyOnchainTask(fid, task.verificationConfig);
        break;
      case 'eas_attestation':
        verified = await verifyEASTask(fid, task.verificationConfig);
        break;
    }

    if (!verified) {
      return NextResponse.json({ 
        success: false, 
        message: 'Task requirements not met' 
      });
    }

    if (redis) {
      const completedKey = `notch:tasks:${fid}:completed`;
      const completedTasks = await redis.get(completedKey);
      const completed = completedTasks ? JSON.parse(completedTasks as string) : [];
      completed.push(taskId);
      
      await redis.setex(completedKey, 86400 * 30, JSON.stringify(completed));
    }

    await fetch(`${process.env.NEXT_PUBLIC_URL}/api/scoring/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        fid, 
        taskId, 
        category: task.category, 
        points: task.points 
      })
    });

    return NextResponse.json({
      success: true,
      message: 'Task completed successfully!',
      points: task.points,
      category: task.category
    });

  } catch (error) {
    console.error('Error verifying task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
