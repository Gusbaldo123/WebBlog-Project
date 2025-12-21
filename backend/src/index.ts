import JobManager from './managers/JobManager';
import app from './managers/RouteManager';
import { config } from './managers/DotEnvManager';

JobManager.startAll();

app.listen(config.port, (): void => {
  console.log(`hosted on http://localhost:${config.port}`);
});