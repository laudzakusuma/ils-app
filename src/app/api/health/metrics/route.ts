import { NextRequest, NextResponse } from 'next/server';
import { HealthAnalyzer } from '@/lib/ai/health-analyzer';
import { updateHealthData } from '@/lib/database/queries';
import { validateHealthData } from '@/lib/utils/validation';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = await verifyJWT(token);
    const healthData = await request.json();

    // Validate incoming health data
    const validatedData = validateHealthData(healthData);
    
    // Store in database
    await updateHealthData(user.id, validatedData);
    
    // Generate AI insights
    const analyzer = new HealthAnalyzer();
    const insights = await analyzer.analyzeHealthMetrics(user.id, validatedData);
    
    // Send real-time updates via WebSocket
    const io = (global as any).io;
    if (io) {
      io.to(`user_${user.id}`).emit('health_update', {
        metrics: validatedData,
        insights: insights
      });
    }

    return NextResponse.json({
      success: true,
      metrics: validatedData,
      insights: insights,
      recommendations: insights.recommendations
    });

  } catch (error) {
    console.error('Health metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to process health data' }, 
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = await verifyJWT(token);
    
    const url = new URL(request.url);
    const timeRange = url.searchParams.get('range') || '7d';
    
    const healthData = await getHealthDataByRange(user.id, timeRange);
    const analytics = await generateHealthAnalytics(healthData);
    
    return NextResponse.json({
      success: true,
      data: healthData,
      analytics: analytics
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch health data' }, 
      { status: 500 }
    );
  }
}