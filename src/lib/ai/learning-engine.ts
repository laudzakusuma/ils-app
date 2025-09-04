export class MachineLearningEngine {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async getPerformanceData() {
    console.log('Fetching performance data for user:', this.userId);
    // Mengembalikan data contoh
    return { taskCompletionRate: 0.9 };
  }
}