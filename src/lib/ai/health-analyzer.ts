import { getHealthHistory } from '@/lib/database/queries';
import { EnergyPattern } from './energy-pattern';

export class HealthAnalyzer {
  async analyzeHealthMetrics(userId: string, metrics: any) {
    const analysis = {
      overall_score: this.calculateOverallHealthScore(metrics),
      trends: await this.analyzeTrends(userId, metrics),
      recommendations: this.generateHealthRecommendations(metrics),
      alerts: this.checkHealthAlerts(metrics),
      insights: this.generateHealthInsights(metrics)
    };

    return analysis;
  }

  private calculateOverallHealthScore(metrics: any): number {
    const weights = {
      heartRate: 0.25,
      hydration: 0.20,
      energy: 0.25,
      steps: 0.15,
      sleep: 0.15
    };

    let totalScore = 0;
    let totalWeight = 0;

    for (const [metric, value] of Object.entries(metrics)) {
      if (weights[metric] && typeof value === 'number') {
        const normalizedScore = this.normalizeHealthMetric(metric, value);
        totalScore += normalizedScore * weights[metric];
        totalWeight += weights[metric];
      }
    }

    return totalWeight > 0 ? Math.round((totalScore / totalWeight) * 100) : 0;
  }

  private normalizeHealthMetric(metric: string, value: number): number {
    // Normalize different health metrics to 0-1 scale
    const ranges = {
      heartRate: { min: 60, max: 100, optimal: 70 },
      hydration: { min: 0, max: 100, optimal: 80 },
      energy: { min: 0, max: 100, optimal: 85 },
      steps: { min: 0, max: 15000, optimal: 10000 },
      sleep: { min: 4, max: 10, optimal: 8 }
    };

    const range = ranges[metric];
    if (!range) return 0.5;

    if (value <= range.optimal) {
      return Math.max(0, (value - range.min) / (range.optimal - range.min));
    } else {
      return Math.max(0, 1 - ((value - range.optimal) / (range.max - range.optimal)));
    }
  }

   private generateHealthRecommendations(metrics: any): string[] {
    const recommendations = [];
    if (metrics.steps < 5000) {
      recommendations.push('Try to be more active today.');
    }
    if (metrics.hydration < 60) {
      recommendations.push('Remember to drink more water.');
    }
    return recommendations;
  }

  private checkHealthAlerts(metrics: any): string[] {
    const alerts = [];
    if (metrics.heartRate > 120 || metrics.heartRate < 50) {
      alerts.push('Unusual heart rate detected.');
    }
    return alerts;
  }

  private generateHealthInsights(metrics: any): string[] {
    return ['Your energy levels are consistent with your sleep patterns.'];
  }

  private async analyzeTrends(userId: string, currentMetrics: any) {
    return {
      steps: 'increasing',
      energy: 'stable'
    };
  }

  async getEnergyPattern(userId: string) {
    // Analyze historical energy patterns
    const historicalData = await getHealthHistory(userId, '30d');
    return new EnergyPattern(historicalData);
  }
}