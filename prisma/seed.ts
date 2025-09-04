import { PrismaClient } from '@prisma/client';
import { PasswordService } from '../src/lib/auth/password';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create test users
  const testUsers = [
    {
      email: 'admin@ils.com',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      passwordHash: await PasswordService.hashPassword('admin123'),
    },
    {
      email: 'demo@ils.com',
      username: 'demo',
      firstName: 'Demo',
      lastName: 'User',
      passwordHash: await PasswordService.hashPassword('demo123'),
    },
  ];

  for (const userData of testUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData,
    });

    console.log(`Created user: ${user.email}`);

    // Create sample health data
    const healthData = Array.from({ length: 30 }, (_, i) => ({
      userId: user.id,
      heartRate: Math.floor(Math.random() * 40) + 60,
      steps: Math.floor(Math.random() * 5000) + 5000,
      hydration: Math.random() * 40 + 60,
      energy: Math.random() * 30 + 70,
      sleep: {
        duration: Math.random() * 2 + 6,
        quality: Math.floor(Math.random() * 4) + 7,
      },
      timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
    }));

    await prisma.healthData.createMany({
      data: healthData,
    });

    // Create sample schedule
    const schedules = [
      {
        userId: user.id,
        title: 'Morning Workout',
        description: 'High-intensity interval training',
        startTime: new Date('2024-03-15T07:00:00Z'),
        endTime: new Date('2024-03-15T08:00:00Z'),
        type: 'HEALTH',
        status: 'PLANNED',
        priority: 'HIGH',
        energyLevel: 'HIGH',
      },
      {
        userId: user.id,
        title: 'Team Meeting',
        description: 'Weekly team sync',
        startTime: new Date('2024-03-15T10:00:00Z'),
        endTime: new Date('2024-03-15T11:00:00Z'),
        type: 'MEETING',
        status: 'PLANNED',
        priority: 'MEDIUM',
        energyLevel: 'MEDIUM',
      },
      {
        userId: user.id,
        title: 'Deep Work Session',
        description: 'Focus on product development',
        startTime: new Date('2024-03-15T14:00:00Z'),
        endTime: new Date('2024-03-15T16:00:00Z'),
        type: 'DEEP_WORK',
        status: 'PLANNED',
        priority: 'HIGH',
        energyLevel: 'HIGH',
      },
    ];

    await prisma.schedule.createMany({
      data: schedules,
    });

    // Create user preferences
    await prisma.userPreferences.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        theme: 'system',
        notifications: {
          email: true,
          push: true,
          sms: false,
        },
        privacy: {
          shareHealthData: false,
          shareLocationData: true,
          allowAnalytics: true,
        },
        aiOptimizationLevel: 'balanced',
        workingHoursStart: '09:00',
        workingHoursEnd: '17:00',
        workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        sleepSchedule: {
          bedtime: '22:00',
          wakeup: '07:00',
        },
        healthGoals: {
          dailySteps: 10000,
          dailyWater: 2500,
          weeklyWorkouts: 4,
        },
        transportPreferences: {
          preferredModes: ['train', 'walking', 'cycling'],
          maxWalkingDistance: 1000,
          prioritizeSpeed: false,
          prioritizeCost: true,
          prioritizeEnvironment: true,
        },
      },
    });

    console.log(`Created preferences for user: ${user.email}`);
  }

  // Create system configuration
  const systemConfigs = [
    {
      key: 'ai_optimization_enabled',
      value: { enabled: true },
      description: 'Enable AI-powered optimizations',
    },
    {
      key: 'maintenance_mode',
      value: { enabled: false },
      description: 'System maintenance mode',
    },
    {
      key: 'feature_flags',
      value: {
        healthInsights: true,
        transportOptimization: true,
        scheduleOptimization: true,
        blockchainSecurity: true,
        realTimeSync: true,
      },
      description: 'Feature flags for gradual rollout',
    },
    {
      key: 'api_rate_limits',
      value: {
        auth: { requests: 5, window: 60000 }, // 5 requests per minute
        api: { requests: 100, window: 60000 }, // 100 requests per minute
        health: { requests: 50, window: 60000 }, // 50 requests per minute
      },
      description: 'API rate limiting configuration',
    },
  ];

  for (const config of systemConfigs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: { value: config.value },
      create: config,
    });
  }

  console.log('✅ Database seeded successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });