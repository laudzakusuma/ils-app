import { prisma } from './prisma';

export async function getUserData(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      healthData: {
        orderBy: { timestamp: 'desc' },
        take: 30
      },
      schedules: {
        where: {
          startTime: {
            gte: new Date()
          }
        }
      },
      preferences: true
    }
  });
}

export async function updateHealthData(userId: string, data: any) {
  return await prisma.healthData.create({
    data: {
      userId,
      heartRate: data.heartRate,
      steps: data.steps,
      hydration: data.hydration,
      energy: data.energy,
      sleep: data.sleep
    }
  });
}

export async function getHealthDataByRange(userId: string, range: string) {
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 7;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return await prisma.healthData.findMany({
    where: {
      userId,
      timestamp: {
        gte: startDate
      }
    },
    orderBy: {
      timestamp: 'desc'
    }
  });
}

export async function generateHealthAnalytics(healthData: any[]) {
  // Mock implementation
  return {
    averageHeartRate: 75,
    totalSteps: 85000,
    insights: ['Your activity levels are improving']
  };
}

export async function cacheTransportData(userId: string, data: any) {
  // Mock implementation for transport data caching
  console.log('Caching transport data for user:', userId);
}

export async function getHealthHistory(userId: string, range: string) {
  return await getHealthDataByRange(userId, range);
}