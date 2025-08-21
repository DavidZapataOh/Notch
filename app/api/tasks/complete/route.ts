import { NextRequest, NextResponse } from 'next/server';
import { scoringEngine } from '@/lib/scoring-engine';
import { DYNAMIC_TASKS } from '@/lib/scoring-engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fid, taskId, verificationData } = body;

    if (!fid || !taskId) {
      return NextResponse.json(
        { error: 'FID and taskId are required' },
        { status: 400 }
      );
    }

    // Buscar la tarea en las tareas dinámicas
    const allTasks = [
      ...DYNAMIC_TASKS.daily,
      ...DYNAMIC_TASKS.weekly,
      ...DYNAMIC_TASKS.special
    ];

    const task = allTasks.find(t => t.id === taskId);
    
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Verificar si la tarea está activa (las tareas dinámicas siempre están activas)
    // TODO: Implementar verificación de fechas cuando se agreguen a las tareas

    let verificationResult = false;

    switch (task.verificationMethod) {
      case 'farcaster_api':
        verificationResult = await scoringEngine.verifyFarcasterActivity(
          fid,
          'publish',
          task.verificationConfig
        );
        break;
      
      case 'onchain':
        const onchainConfig = task.verificationConfig as { eventType: string; network: string };
        verificationResult = await scoringEngine.verifyOnChainActivity(
          fid,
          onchainConfig.eventType,
          onchainConfig.network
        );
        break;
      
      case 'eas_attestation':
        verificationResult = await verifyEASAttestation(fid, task.verificationConfig);
        break;
      
      case 'referral':
        verificationResult = await verifyReferrals(fid, task.verificationConfig);
        break;
      
      default:
        verificationResult = true; 
    }

    if (!verificationResult) {
      return NextResponse.json(
        { error: 'Activity verification failed' },
        { status: 400 }
      );
    }

    const success = await scoringEngine.completeTask(
      fid,
      taskId,
      task.category,
      task.points,
      verificationData || {},
      { account: { address: '0x0000000000000000000000000000000000000000' }, chain: { id: 8453 } } as any
    );

    if (!success) {
      return NextResponse.json(
        { error: 'Task already completed or failed to complete' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      taskId,
      points: task.points,
      category: task.category,
      message: 'Task completed successfully'
    });

  } catch (error) {
    console.error('Error completing task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function verifyEASAttestation(fid: number, config: any): Promise<boolean> {
  try {
    // Aquí implementarías la verificación de attestations de EAS
    // Por ejemplo, verificar si el usuario tiene attestations de partners específicos
    
    const { easClient } = await import('@/lib/eas-client');
    
    if (config.schemaIds && config.schemaIds.length > 0) {
      return true; 
    }
    
    return true;
  } catch (error) {
    console.error('Error verifying EAS attestation:', error);
    return false;
  }
}

async function verifyReferrals(fid: number, config: any): Promise<boolean> {
  try {
    // Aquí implementarías la verificación de referencias
    // Por ejemplo, verificar si el usuario ha invitado a otros usuarios
    
    const minReferrals = config.minReferrals || 1;
    
    // Implementar lógica de verificación de referencias
    // Esto podría involucrar verificar attestations de referencias o tracking en EAS
    
    return true; // Placeholder
  } catch (error) {
    console.error('Error verifying referrals:', error);
    return false;
  }
}
