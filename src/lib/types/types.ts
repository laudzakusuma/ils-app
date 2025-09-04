export interface UserData {
  id: string;
  // Tambahkan properti lain jika diperlukan, misal:
  // preferences: any;
  // healthData: any[];
}

export interface Task {
  id: string;
  title: string;
  priority: number;
  preferredTime?: string;
  duration: number;
}

export interface Schedule {
  id: string;
  userId: string;
  title: string;
  startTime: string;
  endTime: string;
  priority: number;
  energyRequirement: number;
}

export interface OptimizationResult {
  schedule: Schedule[];
  efficiencyScore: number;
  insights: string[];
  optimizationFactors: {
    energyAlignment: number;
    priorityBalance: number;
    timeEfficiency: number;
  };
}