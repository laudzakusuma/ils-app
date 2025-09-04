export interface UserData {
  id: string;
  // tambahkan properti lain yang relevan
}

export interface Task {
  id: string;
  priority: number;
  preferredTime: string;
  // tambahkan properti lain
}

export interface Schedule {
  startTime: string;
  priority: number;
  energyRequirement: number;
  // tambahkan properti lain
}

export interface OptimizationResult {
  schedule: Schedule[];
  efficiencyScore: number;
  insights: string[];
  optimizationFactors: any;
}