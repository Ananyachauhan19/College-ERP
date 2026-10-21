require('dotenv').config();
const mongoose = require('mongoose');

let mongodInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (uri) {
    try {
      console.log(`[DB] Attempting connection to configured MongoDB URI...`);
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 8000,
        dbName: 'college_erp',
      });
      console.log(`[DB] Successfully connected to MongoDB: ${mongoose.connection.host}`);
      return;
    } catch (err) {
      console.warn(`[DB] Failed to connect to configured MongoDB URI (${err.message}). Falling back to Embedded In-Memory MongoDB...`);
    }
  } else {
    console.log(`[DB] No MONGODB_URI found in environment. Initializing Embedded In-Memory MongoDB...`);
  }

  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongodInstance = await MongoMemoryServer.create();
    const memoryUri = mongodInstance.getUri();
    await mongoose.connect(memoryUri);
    console.log(`[DB] Successfully connected to Embedded In-Memory MongoDB at ${memoryUri}`);
  } catch (err) {
    console.error(`[DB] Critical Error initializing In-Memory MongoDB:`, err);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
};

module.exports = { connectDB, disconnectDB };
