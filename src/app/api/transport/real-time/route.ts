import { NextRequest, NextResponse } from 'next/server';
import { TransportOptimizer } from '@/lib/ai/transport-optimizer';
import { GoogleMapsIntegration } from '@/lib/integrations/maps';
import { WeatherIntegration } from '@/lib/integrations/weather';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = await verifyJWT(token);
    const { origin, destination, preferences } = await request.json();

    // Get real-time data
    const maps = new GoogleMapsIntegration();
    const weather = new WeatherIntegration();
    
    const [routes, weatherData] = await Promise.all([
      maps.getRoutes(origin, destination),
      weather.getCurrentWeather(destination)
    ]);

    // AI optimization
    const optimizer = new TransportOptimizer();
    const optimizedOptions = await optimizer.optimizeTransport(
      routes,
      weatherData,
      user.preferences,
      preferences
    );

    // Cache results for faster subsequent requests
    await cacheTransportData(user.id, {
      origin,
      destination,
      options: optimizedOptions,
      timestamp: new Date()
    });

    return NextResponse.json({
      success: true,
      options: optimizedOptions,
      weather: weatherData,
      updated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Transport optimization error:', error);
    return NextResponse.json(
      { error: 'Failed to get transport options' }, 
      { status: 500 }
    );
  }
}