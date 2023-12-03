import express from 'express';
const app = express();

app.get('/', (req, res): void => {
  res.send('Welcome to Auth Service');
});

export default app;
