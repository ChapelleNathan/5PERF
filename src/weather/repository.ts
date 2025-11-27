import pg from 'pg';
import config from 'config';
import { WeatherData, WeatherDataSchema, WeatherFilter } from './dto.js';
import logger from '../logger.js';

const poolConfig = config.get<pg.PoolConfig>('database');

export class WeatherDataRepository {
  private pool: pg.Pool;

  constructor() {
    this.pool = new pg.Pool(poolConfig);
  }

  async createTable(): Promise<void> {
    const query = `
            CREATE TABLE IF NOT EXISTS weather (
                location VARCHAR(256),
                date DATE,
                temperature DECIMAL,
                humidity DECIMAL,
                PRIMARY KEY(location, date)
            )
        `;
    await this.pool.query(query);
  }

  async insertWeatherData(weatherData: WeatherData): Promise<void> {
    const query = `
            INSERT INTO weather (location, date, temperature, humidity)
            VALUES ($1, $2, $3, $4)
        `;

    const values = [
      weatherData.location,
      weatherData.date,
      weatherData.temperature,
      weatherData.humidity,
    ];
    await this.pool.query(query, values);
  }

  async getWeatherDataByLocation(
    location: string
  ): Promise<WeatherData[] | null> {
    const query = `
            SELECT * FROM weather WHERE location = $1
        `;

    const result: pg.QueryResult = await this.pool.query(query, [location]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows.map((row) =>
      WeatherDataSchema.parse(row)
    ) as WeatherData[];
  }

  async getAllWeatherData(): Promise<WeatherData[]> {
    const query = 'SELECT * FROM weather';
    const result: pg.QueryResult = await this.pool.query(query);
    return result.rows as WeatherData[];
  }

  async getAvgWeatherData(location: string, dateFilter: WeatherFilter): Promise<number | null> {
    let index = 2;
    let query = `
        SELECT avg(weather.temperature) FROM weather
        WHERE location = $1
      `
    const options: any[] = [
      location
    ]
    if(dateFilter.from) {
      query += ` AND weather.date >= $${index}`
      index++
      options.push(dateFilter.from)
    }
    if(dateFilter.to) {
      query += ` AND weather.date <= $${index}`
      options.push(dateFilter.to)
    }
    
    const result: pg.QueryResult = await this.pool.query(query, options);
    return result.rows[0].avg ?? null;
  }
}

export default new WeatherDataRepository();
