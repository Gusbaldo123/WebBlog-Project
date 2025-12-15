import express, { Application, Request, Response, NextFunction } from 'express';
import { config } from './managers/DotEnvManager';
import JobManager from './managers/JobManager';

import authorRouter from "./routes/AuthorRouter"
import postRouter from './routes/PostRouter';
import categoryRouter from './routes/CategoryRouter';

JobManager.startAll();

const app: Application = express();
const cors = require('cors');

app.use(cors({ origin: '*' }));
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof SyntaxError && 'body' in error) {
    return res.status(400).json({
      error: 'Invalid JSON format',
      message: 'The request body must be a valid JSON object',
      details: error.message
    });
  }
  next();
});
app.use(express.json());
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof SyntaxError) {
    return res.status(400).json({
      error: 'JSON Parsing Error',
      message: 'Failed to parse JSON body',
      details: error.message
    });
  }
  next();
});
app.use('/author', authorRouter);
app.use('/post', postRouter);
app.use('/category', categoryRouter);
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', error);

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: 'Server Error',
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

app.get('/health', (_, res) => res.send("ok"));
app.use((req, res, next) => {
  res.status(404).send('Sorry, the page you are looking for could not be found.');
});
app.listen(config.port, (): void => {
  console.log(`hosted on http://localhost:${config.port}`);
});

const cron = require('node-cron');
cron.schedule('*/5 * * * *', async (meuJob: NextFunction) => {
    
});
