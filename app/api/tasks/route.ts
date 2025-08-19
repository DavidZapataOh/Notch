import { NextResponse } from "next/server";

interface SpecialTask {
  id: string;
  title: string;
  description: string;
  category: 'Social' | 'Builder' | 'Degen' | 'Player';
  points: number;
  startDate: string;
  endDate: string;
  verificationMethod: 'farcaster_api' | 'onchain' | 'eas_attestation';
  verificationConfig: Record<string, unknown>;
  active: boolean;
}

const CURRENT_TASKS: SpecialTask[] = [
  {
    id: 'daily-cast-notch',
    title: 'Share about Notch',
    description: 'Post a cast mentioning @notch or #notch',
    category: 'Social',
    points: 25,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    verificationMethod: 'farcaster_api',
    verificationConfig: {
      keywords: ['notch', '@notch', '#notch'],
      minLength: 10
    },
    active: true
  },
  {
    id: 'deploy-base-contract',
    title: 'Deploy on Base',
    description: 'Deploy any smart contract on Base network',
    category: 'Builder',
    points: 100,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    verificationMethod: 'onchain',
    verificationConfig: {
      network: 'base',
      eventType: 'contract_creation'
    },
    active: true
  },
  {
    id: 'swap-on-base',
    title: 'Make a Swap',
    description: 'Execute any token swap on Base network',
    category: 'Degen',
    points: 15,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    verificationMethod: 'onchain',
    verificationConfig: {
      network: 'base',
      eventType: 'token_swap',
      minValue: 0.001
    },
    active: true
  },
  {
    id: 'use-partner-miniapp',
    title: 'Try Partner App',
    description: 'Use any partner miniapp and complete an action',
    category: 'Player',
    points: 30,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    verificationMethod: 'eas_attestation',
    verificationConfig: {
      schemaIds: ['0x...'], // Schema IDs de partners
      minAttestations: 1
    },
    active: true
  }
];

export async function GET() {
  try {
    // Filtrar solo tareas activas y dentro del rango de fechas
    const now = new Date();
    const activeTasks = CURRENT_TASKS.filter(task => {
      const startDate = new Date(task.startDate);
      const endDate = new Date(task.endDate);
      return task.active && now >= startDate && now <= endDate;
    });

    return NextResponse.json({
      tasks: activeTasks,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
