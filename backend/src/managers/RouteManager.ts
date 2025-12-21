import express, { Application, Request, Response, NextFunction } from 'express';

import authorRouter from "../routes/AuthorRouter"
import postRouter from '../routes/PostRouter';
import categoryRouter from '../routes/CategoryRouter';

const cors = require('cors');

const app: Application = express();

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use('/author', authorRouter);
app.use('/post', postRouter);
app.use('/category', categoryRouter);
app.get('/health', (_, res) => res.send("ok"));
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
app.use((req, res, next) => {
  res.status(404).send('Sorry, the page you are looking for could not be found.');
});

export default app;