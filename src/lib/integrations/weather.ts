export class WeatherIntegration {
  async getCurrentWeather(location: string) {
    console.log(`Getting weather for ${location}`);
    // Logika untuk mengambil data dari Weather API
    // Mengembalikan data contoh
    return { condition: 'clear', temperature: 28 };
  }
}