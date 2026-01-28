import { DataSource } from 'typeorm';
import { env } from './src/@config/envs/env.validation';

export default new DataSource({
  type: 'postgres',
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USER,
  password: env.DB_PASS,
  database: env.DB_NAME,
  entities: ['dist/**/*.entity.js'],
  synchronize: false, // ✅ mantenha false em produção
  migrations: ['dist/migrations/*.js'],
});
