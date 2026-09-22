import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log("Attempting MongoDB connection...");

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:");
    console.error(error);
  }
};

export default connectDB;