const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Validate critical environment variables
function validateEnv() {
  const missing = [];
  if (!process.env.MONGODB_URI) missing.push('MONGODB_URI');
  if (!process.env.JWT_SECRET) missing.push('JWT_SECRET');

  if (missing.length > 0) {
    console.error('=====================================================');
    console.error('FATAL ERROR: MISSING REQUIRED ENVIRONMENT VARIABLES:');
    missing.forEach(varName => console.error(`  - ${varName}`));
    console.error('Please configure your server/.env file before running.');
    console.error('See server/.env.example for details.');
    console.error('=====================================================');
    process.exit(1);
  }
}

async function startServer() {
  validateEnv();

  console.log('------------------------------------------------------------');
  console.log('Smart Resume Parsing & Competency Assessment Platform');
  console.log('Initializing database connection...');
  console.log('------------------------------------------------------------');

  try {
    // Wait for successful MongoDB connection before binding to port
    await connectDB();

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Backend Server is running on port ${PORT} (0.0.0.0)`);
      console.log(`API Base URL: http://localhost:${PORT}/api`);
      console.log(`Ready to accept requests from all network origins`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
      });
    });
  } catch (error) {
    console.error('Application startup aborted: Database connection failed.');
    process.exit(1);
  }
}

startServer();
