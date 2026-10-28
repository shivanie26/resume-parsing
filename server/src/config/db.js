const mongoose = require('mongoose');
const dns = require('dns');

// Configure reliable DNS servers to resolve MongoDB Atlas SRV records smoothly on all networks
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (dnsErr) {
  // Use system default DNS if setServers is restricted
}

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('CRITICAL CONFIGURATION ERROR: MONGODB_URI is not defined in environment variables.');
    console.error('Please configure MONGODB_URI in your server/.env file.');
    throw new Error('MONGODB_URI is required to start the application.');
  }

  // Mask credentials in console log for security
  const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
  console.log(`Connecting to MongoDB at: ${maskedUri}...`);

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000 // Timeout early if server cannot be reached
    });

    console.log(`MongoDB Connected successfully: ${conn.connection.host} (DB: ${conn.connection.name})`);
    return conn;
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    console.error('\n--- TROUBLESHOOTING MONGODB CONNECTION ---');
    console.error('1. Check if your MongoDB service is running (if using local MongoDB).');
    console.error('2. If using MongoDB Atlas, check:');
    console.error('   a. Network Access: Ensure your IP address (or 0.0.0.0/0 for dev) is whitelisted in Atlas.');
    console.error('   b. Database User: Ensure the username and password in MONGODB_URI are correct.');
    console.error('   c. Password Characters: If your password contains special characters like @, #, or %, URL-encode them (e.g. @ -> %40).');
    console.error('   d. Database Name: Ensure a database name is specified before the query parameters.');
    console.error('-------------------------------------------\n');
    throw error;
  }
};

module.exports = connectDB;
