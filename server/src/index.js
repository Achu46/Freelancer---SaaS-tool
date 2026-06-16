import { createApp } from './app.js';
import { env } from './config/env.js';

const app = createApp();

app.listen(env.PORT, () => {
  console.info(`ClinicOS API listening on :${env.PORT}`);
});
