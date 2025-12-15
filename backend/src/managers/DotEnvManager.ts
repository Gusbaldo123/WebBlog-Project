import dotenv from 'dotenv';
import path from 'path';

const current = 'development'; // 'development' or 'production'
const env = process.env.NODE_ENV || current;

const envFile = `.env.${env}`;

dotenv.config({ path: path.resolve(process.cwd(), envFile) });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const config = {
  env: process.env.NODE_ENV || current,
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL,
  apiKey: process.env.API_KEY,
};