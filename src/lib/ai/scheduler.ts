import { UserData, Task, Schedule, OptimizationResult } from '@/lib/types/types';
import { HealthAnalyzer } from './health-analyzer';
import { MachineLearningEngine } from './learning-engine';

export class AIScheduleOptimizer {
  private userData: UserData;
  private healthAnalyzer: HealthAnalyzer;
  private mlEngine: MachineLearningEngine;

  constructor(userData: UserData) {
    this.userData = userData;
    this.healthAnalyzer = new HealthAnalyzer();
    this.mlEngine = new MachineLearningEngine(userData.id);
  }

  async optimizeSchedule(
    tasks: Task[], 
    preferences: any, 
    constraints: any
  ): Promise<OptimizationResult> {
    const energyPattern = await this.healthAnalyzer.getEnergyPattern(this.userData.id);
    const performanceData = await this.mlEngine.getPerformanceData();
    
    const optimizedTasks = this.optimizeTaskScheduling(
      tasks,
      energyPattern,
      performanceData,
      preferences,
      constraints
    );

    const efficiencyScore = this.calculateEfficiencyScore(optimizedTasks);
    const insights = this.generateInsights(optimizedTasks, energyPattern);

    return {
      schedule: optimizedTasks,
      efficiencyScore,
      insights,
      optimizationFactors: {
        energyAlignment: this.calculateEnergyAlignment(optimizedTasks, energyPattern),
        priorityBalance: this.calculatePriorityBalance(optimizedTasks),
        timeEfficiency: this.calculateTimeEfficiency(optimizedTasks)
      }
    };
  }

  private optimizeTaskScheduling(
    tasks: Task[],
    energyPattern: any,
    performanceData: any,
    preferences: any,
    constraints: any
  ): Schedule[] {
    const sortedTasks = tasks.sort((a, b) => {
      const priorityScore = (b.priority || 0) - (a.priority || 0);
      const energyScore = this.calculateEnergyScore(a, b, energyPattern);
      const performanceScore = this.calculatePerformanceScore(a, b, performanceData);
      
      return priorityScore * 0.4 + energyScore * 0.3 + performanceScore * 0.3;
    });

    return this.assignTimeSlots(sortedTasks, energyPattern, constraints);
  }

  private calculateEnergyScore(taskA: Task, taskB: Task, energyPattern: any): number {
    const taskAEnergyFit = this.getEnergyFit(taskA, energyPattern);
    const taskBEnergyFit = this.getEnergyFit(taskB, energyPattern);
    return taskBEnergyFit - taskAEnergyFit;
  }

  private getEnergyFit(task: Task, energyPattern: any): number {
    const taskEnergyRequirement = this.getTaskEnergyRequirement(task);
    const availableEnergy = energyPattern.getEnergyAtTime(task.preferredTime || '09:00');
    if (taskEnergyRequirement === 0) return 1.0;
    return Math.min(availableEnergy / taskEnergyRequirement, 1.0);
  }
    
  private calculateEfficiencyScore(schedule: Schedule[]): number {
    if (!schedule || schedule.length === 0) return 0;
    let totalScore = 0;
    let totalWeight = 0;

    for (const item of schedule) {
      const itemScore = this.calculateItemEfficiency(item);
      const weight = item.priority || 1;
      totalScore += itemScore * weight;
      totalWeight += weight;
    }
    
    if (totalWeight === 0) return 0;
    return Math.round((totalScore / totalWeight) * 100);
  }

  private generateInsights(schedule: Schedule[], energyPattern: any): string[] {
    const insights = [];
    const highEnergyTasks = schedule.filter(s => (s as any).energyRequirement > 0.7);
    const peakEnergyHours = energyPattern.getPeakHours();

    if (highEnergyTasks.length > 0) {
      const alignedTasks = highEnergyTasks.filter(t => 
        peakEnergyHours.includes(new Date(t.startTime).getHours())
      );
      
      if (alignedTasks.length / highEnergyTasks.length > 0.8) {
        insights.push('Perfect energy alignment: Your demanding tasks are scheduled during peak energy hours.');
      } else {
        insights.push('Energy optimization opportunity: Consider moving high-energy tasks to your peak performance hours.');
      }
    }
    return insights;
  }

  // --- METODE-METODE BARU YANG DIPERLUKAN ---
  private calculatePerformanceScore(taskA: Task, taskB: Task, performanceData: any): number {
    return 0; // Implementasi contoh
  }

  private assignTimeSlots(tasks: Task[], energyPattern: any, constraints: any): Schedule[] {
    // Implementasi contoh: ubah Task menjadi Schedule
    const now = new Date();
    return tasks.map((task, index) => {
        const startTime = new Date(now.getTime() + index * 60 * 60 * 1000); // Setiap jam
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
        return {
            ...task,
            id: task.id || `task-${index}`,
            title: `Task ${index + 1}`,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            energyRequirement: this.getTaskEnergyRequirement(task),
        } as unknown as Schedule;
    });
  }

  private getTaskEnergyRequirement(task: Task): number {
    return 0.5; // Implementasi contoh
  }
  
  private calculateItemEfficiency(item: Schedule): number {
    return (item.priority || 1) * 10; // Implementasi contoh
  }

  private calculateEnergyAlignment(schedule: Schedule[], energyPattern: any): number {
    return 80; // Implementasi contoh
  }

  private calculatePriorityBalance(schedule: Schedule[]): number {
    return 90; // Implementasi contoh
  }

  private calculateTimeEfficiency(schedule: Schedule[]): number {
    return 95; // Implementasi contoh
  }
}