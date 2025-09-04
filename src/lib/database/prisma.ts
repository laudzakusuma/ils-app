import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'error', 'warn'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  }).$extends(withAccelerate());

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Database query functions
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