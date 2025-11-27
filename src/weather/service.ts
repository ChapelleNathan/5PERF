import repositoryInstance, { WeatherDataRepository } from './repository.js';
import { WeatherData, WeatherFilter } from './dto.js';

export class WeatherService {
  private weatherRepository: WeatherDataRepository;
  constructor() {
    this.weatherRepository = repositoryInstance;
  }

  async addData(data: WeatherData) {
    return this.weatherRepository.insertWeatherData(data);
  }



  async getData(location: string, options: WeatherFilter) {
    const { page } = options;
    const data = await this.weatherRepository.getWeatherDataByLocation(location, page);

    // Plus besoins de filtre temporel dans cette méthode, de la pur lecture

    // if (data === null) {
    //   return null;
    // }
    // return data.filter((datum) => {
    //   if (
    //     from &&
    //     (dayjs(from).isAfter(datum.date) || dayjs(from).isSame(datum.date))
    //   ) {
    //     return false;
    //   }
    //   if (to && dayjs(to).isBefore(datum.date)) {
    //     return false;
    //   }
    //   return true;
    // });
    return data
  }

  async getMean(location: string, options: WeatherFilter) {
    // Code d'origine
    // const data = await this.getData(location, options);
    // if (data === null) {
    //   return null;
    // }
    // const mean =
    //   data
    //     .map((datum) => datum.temperature)
    //     .reduce((acc, current) => acc + current, 0.0) / data.length;

    return await this.weatherRepository.getAvgWeatherData(location, options)
  }

  async getMax(location: string, options: WeatherFilter) {
    // Code d'origin
    // const data = await this.getData(location, options);
    // if (data === null) {
    //   return null;
    // }
    // const mean = data
    //   .map((datum) => datum.temperature)
    //   .reduce((acc, current) => Math.max(acc, current), data[0].temperature);

    return this.weatherRepository.getMaxWeatherTemp(location, options);
  }

  async getMin(location: string, options: WeatherFilter) {
    // const data = await this.getData(location, options);

    // if (data === null) {
    //   return null;
    // }
    // const mean = data
    //   .map((datum) => datum.temperature)
    //   .reduce((acc, current) => Math.min(acc, current), data[0].temperature);

    return await this.weatherRepository.getMinWeatherTemp(location, options);
  }
}

export default new WeatherService();
