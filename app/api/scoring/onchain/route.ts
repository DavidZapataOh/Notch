import { NextResponse } from "next/server";

async function fetchOnChainData(fid: number) {
  try {
    console.log(`🔍 Fetching on-chain data for FID ${fid}...`);
    
    const apiKey = process.env.NEYNAR_API_KEY;
    if (!apiKey) {
      console.error('❌ NEYNAR_API_KEY not configured');
      return null;
    }

    const userResponse = await fetch(
      `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`,
      { headers: { 'api_key': apiKey } }
    );

    if (!userResponse.ok) {
      console.error(`❌ Failed to fetch user data: ${userResponse.status}`);
      return null;
    }

    const userData = await userResponse.json();
    const user = userData.users?.[0];
    const addresses = user?.verified_addresses?.eth_addresses || [];

    if (addresses.length === 0) {
      console.log(`ℹ️ No verified addresses for FID ${fid}`);
      return {
        contracts_deployed: 0,
        tokens_created: 0,
        nfts_created: 0,
        swaps_made: 0,
        unique_tokens: 0,
        unique_nfts: 0
      };
    }

    const alchemyKey = process.env.ALCHEMY_API_KEY;
    if (!alchemyKey) {
      console.error('❌ ALCHEMY_API_KEY not configured');
      return null;
    }

    let totalContracts = 0;
    let totalTokens = 0;
    let totalNFTs = 0;
    let totalSwaps = 0;

    for (const address of addresses) {
      try {
        const tokenResponse = await fetch(
          `https://base-mainnet.g.alchemy.com/v2/${alchemyKey}/getTokenBalances?address=${address}`,
          { method: 'GET' }
        );
        
        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          totalTokens += tokenData.tokenBalances?.length || 0;
        }

        const nftResponse = await fetch(
          `https://base-mainnet.g.alchemy.com/v2/${alchemyKey}/getNFTs?owner=${address}`,
          { method: 'GET' }
        );
        
        if (nftResponse.ok) {
          const nftData = await nftResponse.json();
          totalNFTs += nftData.ownedNfts?.length || 0;
        }

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
                maxCount: 100
              }],
              id: 1
            })
          }
        );

        if (txResponse.ok) {
          const txData = await txResponse.json();
          const contractCreations = txData.result?.transfers?.filter((tx: { to: string | null; }) => !tx.to) || [];
          totalContracts += contractCreations.length;
          
          const swaps = txData.result?.transfers?.filter((tx: { value: number; }) => tx.value > 0) || [];
          totalSwaps += swaps.length;
        }

      } catch (error) {
        console.error(`❌ Error fetching data for address ${address}:`, error);
      }
    }

    console.log(`✅ On-chain data for FID ${fid}: ${totalContracts} contracts, ${totalTokens} tokens, ${totalNFTs} NFTs, ${totalSwaps} swaps`);

    return {
      contracts_deployed: totalContracts,
      tokens_created: Math.floor(totalContracts * 0.3),
      nfts_created: Math.floor(totalContracts * 0.2),
      swaps_made: totalSwaps,
      unique_tokens: totalTokens,
      unique_nfts: totalNFTs
    };
    
  } catch (error) {
    console.error('❌ Error fetching on-chain data:', error);
    return null;
  }
}

function calculateBuilderScore(data: {
  contracts_deployed: number;
  tokens_created: number;
  nfts_created: number;
}): number {
  let score = 0;
  
  score += (data.contracts_deployed || 0) * 50;
  score += (data.tokens_created || 0) * 20;
  score += (data.nfts_created || 0) * 10;
  
  return Math.min(score, 200);
}

function calculateDegenScore(data: {
  swaps_made: number;
  unique_tokens: number;
  unique_nfts: number;
}): number {
  let score = 0;
  
  score += (data.swaps_made || 0) * 5;
  score += Math.min(data.unique_tokens || 0, 50) * 1;
  score += Math.min(data.unique_nfts || 0, 100) * 2;
  
  return Math.min(score, 150);
}

export async function POST(request: Request) {
  try {
    const { fid } = await request.json();
    
    if (!fid) {
      return NextResponse.json({ error: 'FID required' }, { status: 400 });
    }

    const onchainData = await fetchOnChainData(fid);
    
    if (!onchainData) {
      return NextResponse.json({
        fid,
        builderScore: 0,
        degenScore: 0,
        actions: []
      });
    }
    
    const builderScore = calculateBuilderScore(onchainData);
    const degenScore = calculateDegenScore(onchainData);
    
    return NextResponse.json({
      fid,
      builderScore,
      degenScore,
      onchainData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error calculating on-chain score:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
