// src/managers/JobManager.ts
import cron from 'node-cron';
import { ScheduledTask } from 'node-cron';
import { PostService } from '../services/PostService';
import { CategoryService } from '../services/CategoryService';
import { AuthorService } from '../services/AuthorService';

class JobManager {
    private static instance: JobManager;
    private postService: PostService = new PostService();
    private jobs: ScheduledTask[] = [];

    private constructor() {
        this.initJobs();
    }

    static getInstance(): JobManager {
        if (!JobManager.instance) {
            JobManager.instance = new JobManager();
        }
        return JobManager.instance;
    }

    private initJobs(): void {
        const job1: ScheduledTask = cron.schedule('0 0 * * *', async () => await this.executeJob());

        this.jobs.push(job1);

        console.log(`${this.jobs.length} jobs scheduled`);
    }

    private async executeJob(): Promise<any> {
        return await this.postService.createWithAgent();
    }

    public startAll(): void {
        this.postService = new PostService();
        this.jobs.forEach(job => job.start());
    }

    public stopAll(): void {
        this.jobs.forEach(job => job.stop());
    }

    public async getJobStatus(): Promise<Array<{ expression: string, status: string }>> {
        const statuses = Array<{ expression: string, status: string }>();
        this.jobs.map(async job => (
            statuses.push({
                expression: job.name || 'unknown',
                status: await job.getStatus()
            })
        ));
        return statuses;
    }
}

export default JobManager.getInstance();