import { UserData, Task, Schedule, OptimizationResult } from '@/lib/types';
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
    // Get user's energy patterns from health data
    const energyPattern = await this.healthAnalyzer.getEnergyPattern(this.userData.id);
    
    // Get historical performance data
    const performanceData = await this.mlEngine.getPerformanceData();
    
    // Apply AI optimization algorithm
    const optimizedTasks = this.optimizeTaskScheduling(
      tasks,
      energyPattern,
      performanceData,
      preferences,
      constraints
    );

    // Calculate efficiency score
    const efficiencyScore = this.calculateEfficiencyScore(optimizedTasks);
    
    // Generate AI insights
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
    // Complex AI algorithm for task scheduling
    const sortedTasks = tasks.sort((a, b) => {
      // Multi-factor sorting based on:
      // 1. Priority
      // 2. Energy requirements vs available energy
      // 3. Historical performance
      // 4. User preferences
      // 5. Time constraints

      const priorityScore = b.priority - a.priority;
      const energyScore = this.calculateEnergyScore(a, b, energyPattern);
      const performanceScore = this.calculatePerformanceScore(a, b, performanceData);
      
      return priorityScore * 0.4 + energyScore * 0.3 + performanceScore * 0.3;
    });

    // Convert to schedule with time slots
    return this.assignTimeSlots(sortedTasks, energyPattern, constraints);
  }

  private calculateEnergyScore(taskA: Task, taskB: Task, energyPattern: any): number {
    // Implementation of energy-based scoring
    const taskAEnergyFit = this.getEnergyFit(taskA, energyPattern);
    const taskBEnergyFit = this.getEnergyFit(taskB, energyPattern);
    return taskBEnergyFit - taskAEnergyFit;
  }

  private getEnergyFit(task: Task, energyPattern: any): number {
    // Calculate how well a task fits the user's energy pattern
    const taskEnergyRequirement = this.getTaskEnergyRequirement(task);
    const availableEnergy = energyPattern.getEnergyAtTime(task.preferredTime);
    return Math.min(availableEnergy / taskEnergyRequirement, 1.0);
  }

  private calculateEfficiencyScore(schedule: Schedule[]): number {
    // Calculate overall efficiency score (0-100)
    let totalScore = 0;
    let weights = 0;

    for (const item of schedule) {
      const itemScore = this.calculateItemEfficiency(item);
      const weight = item.priority;
      totalScore += itemScore * weight;
      weights += weight;
    }

    return weights > 0 ? (totalScore / weights) * 100 : 0;
  }

  private generateInsights(schedule: Schedule[], energyPattern: any): string[] {
    const insights = [];

    // Analyze schedule patterns
    const highEnergyTasks = schedule.filter(s => s.energyRequirement > 0.7);
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

    // Add more intelligent insights based on patterns
    return insights;
  }
}