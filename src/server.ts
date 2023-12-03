import app from './app';
import { Config } from './config';

const startServer = () => {
  const PORT = Config.PORT;
  try {
    // eslint-disable-next-line no-console, @typescript-eslint/no-unsafe-call
    app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  }
};

startServer();
