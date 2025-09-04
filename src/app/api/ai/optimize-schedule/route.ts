import { NextRequest, NextResponse } from 'next/server';
import { AIScheduleOptimizer } from '@/lib/ai/scheduler';
import { getUserData } from '@/lib/database/queries';
import { verifyJWT } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await verifyJWT(token);
    const { tasks, preferences, constraints } = await request.json();

    const userData = await getUserData(user.id);
    const optimizer = new AIScheduleOptimizer(userData);
    
    const optimizedSchedule = await optimizer.optimizeSchedule(
      tasks, 
      preferences, 
      constraints
    );

    return NextResponse.json({
      success: true,
      schedule: optimizedSchedule,
      efficiency_score: optimizedSchedule.efficiencyScore,
      ai_insights: optimizedSchedule.insights
    });

  } catch (error) {
    console.error('Schedule optimization error:', error);
    return NextResponse.json(
      { error: 'Failed to optimize schedule' }, 
      { status: 500 }
    );
  }
}