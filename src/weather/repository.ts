import pg from 'pg';
import config from 'config';
import { WeatherData, WeatherDataSchema, WeatherFilter, WeatherFilterSchema } from './dto.js';
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
                location VARCHAR(100),
                date DATE,
                temperature REAL,
                humidity REAL,
                PRIMARY KEY(location, date)
            ) PARTITION BY RANGE (date)
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
    location: string,
    offset: number,
    limit: number
  ): Promise<WeatherData[] | null> {
    const query = `
            SELECT weather.temperature, weather.humidity, weather.date FROM weather 
            WHERE location = $1 
            ORDER BY weather.date DESC
            LIMIT $2 OFFSET $3
        `;

    const result: pg.QueryResult = await this.pool.query(query, [location, limit,offset]);

    if (result.rows.length === 0) {
      return null;
    }

    // return result.rows.map((row) =>
    //   WeatherDataSchema.parse(row)
    // ) as WeatherData[];

    return result.rows as WeatherData[];
  }

  async getAllWeatherData(offset: number, limit: number): Promise<WeatherData[]> {
    const query = `
        SELECT weather.location, weather.temperature 
        FROM weather
        ORDER BY weather.date
        LIMIT $1 OFFSET $2
      `;
    const result: pg.QueryResult = await this.pool.query(query, [limit, offset]);
    return result.rows as WeatherData[];
  }

  async getAvgWeatherData(location: string, dateFilter: WeatherFilter): Promise<string | null> {
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

  async getMaxWeatherTemp(location: string, dateFilter: WeatherFilter): Promise<string| null> {
    let index = 2;
    let query = `
      SELECT max(weather.temperature) FROM weather
      WHERE location = $1
    `
    const options: any[] = [location]

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
    return result.rows[0].max ?? null;
  }

  async getMinWeatherTemp(location: string, dateFilter: WeatherFilter): Promise<string | null> {
    let index = 2;
    let query = `
      SELECT min(weather.temperature) FROM weather
      WHERE location = $1
    `
    const options: any[] = [location]

    if(dateFilter.from) {
      query += ` AND weather.date >= $${index}`
      index++
      options.push(dateFilter.from);
    }

    if(dateFilter.to) {
      query += ` AND weather.date <= $${index}`
      options.push(dateFilter.to)
    }

    const result: pg.QueryResult = await this.pool.query(query, options);
    return result.rows[0].min ?? null;
  }
}


export default new WeatherDataRepository();
