const app = require('./app');
const connectDB = require('./config/database');
const { port } = require('./config/env');

const start = async () => {
  await connectDB();
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Health check: http://localhost:${port}/health`);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
