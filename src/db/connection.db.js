import mongoose from "mongoose";

import { MONGO_URI, MONGO_DB_NAME } from "../../config/env.config.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      dbName: MONGO_DB_NAME,
    });

    if (!mongoose.connection.db) {
      throw new Error("MongoDB database connection is not available");
    }

    await mongoose.connection.db.command({ ping: 1 });

    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
};

export const checkDBHealth = async () => {
  try {
    if (!mongoose.connection.db) {
      return false;
    }

    await mongoose.connection.db.command({ ping: 1 });

    return true;
  } catch {
    return false;
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();

    console.log("MongoDB disconnected");
  } catch (error) {
    console.error("MongoDB disconnection failed:", error);
    throw error;
  }
};
