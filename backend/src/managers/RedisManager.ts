import { createClient } from "redis";
const redisClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });

class RedisManager {
    private static instance: RedisManager;

    private constructor() {
        this.initClient();
    }

    static getInstance(): RedisManager {
        if (!RedisManager.instance) {
            RedisManager.instance = new RedisManager();
        }
        return RedisManager.instance;
    }

    private async initClient(): Promise<void> {
        redisClient.on('error', (err) => console.log('Redis Client Error', err));
        await redisClient.connect();
        console.log('Redis client connected');
    }

    public getClient(): typeof redisClient {
        return redisClient;
    }

    public setValue = async (key: string, value: string, durationMinutes?: number): Promise<void> => {
        if (durationMinutes !== undefined)
            await redisClient.set(key, value, { EX: durationMinutes * 60 });
        else
            await redisClient.set(key, value);
    }

    public getValue = async (key: string): Promise<string | null> => {
        return await redisClient.get(key);
    }

    public deleteValue = async (key: string): Promise<void> => {
        await redisClient.del(key);
    }

    public deleteKeysByPattern = async (pattern:string): Promise<void> => {
        let cursor = '0';
        const reply = await redisClient.scan(cursor, { MATCH: pattern, COUNT: 1000 });
        reply.keys.forEach(async(key) => {
            cursor = reply.cursor;
            await redisClient.del(key);
        });
    }
}

export default RedisManager.getInstance();