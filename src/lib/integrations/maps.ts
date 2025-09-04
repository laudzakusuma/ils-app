export class GoogleMapsIntegration {
  async getRoutes(origin: string, destination: string) {
    console.log(`Getting routes from ${origin} to ${destination}`);
    // Logika untuk mengambil data dari Google Maps API
    // Mengembalikan data contoh
    return [{ mode: 'car', duration: 30, cost: 5 }];
  }
}