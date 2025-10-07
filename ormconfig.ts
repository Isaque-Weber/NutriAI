import { DataSource } from 'typeorm';
import { config } from 'dotenv';
config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: +(process.env.DB_PORT || 5432),
  username: process.env.DB_USER || 'nutriai',
  password: process.env.DB_PASS || 'nutriai',
  database: process.env.DB_NAME || 'nutriai',
  entities: ['dist/**/*.entity.js'],
  synchronize: false, // ✅ mantenha false em produção
  migrations: ['dist/migrations/*.js'],
});
