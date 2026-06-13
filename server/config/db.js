const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/book_a_doctor';
    // Use a short timeout so that if local MongoDB is not running, we switch to fallback quickly
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Local MongoDB connection failed: ${error.message}`);
    console.log('Attempting to spin up in-memory MongoDB fallback...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      console.log(`In-memory MongoDB started at: ${mongoUri}`);
      
      const conn = await mongoose.connect(mongoUri);
      console.log(`Mongoose connected to in-memory fallback: ${conn.connection.host}`);
      
      // Auto-seed the database since it's a fresh in-memory instance
      console.log('Auto-seeding default database records...');
      const seedData = require('../scripts/seed');
      await seedData();
      console.log('Auto-seeding completed successfully.');
    } catch (fallbackError) {
      console.error(`In-memory database fallback failed: ${fallbackError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
