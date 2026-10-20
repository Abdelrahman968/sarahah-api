import { createClient } from "redis";
import { REDIS_URL } from "../../config/env.config.js";

const redisClient = createClient({
  url: REDIS_URL,
});

redisClient.on("ready", () => {
  console.log("Redis ready");
});

redisClient.on("reconnecting", () => {
  console.log("Redis reconnecting...");
});

redisClient.on("error", (error) => {
  console.error("Redis error:", error);
});

redisClient.on("end", () => {
  console.log("Redis connection closed");
});

export const connectRedis = async () => {
  try {
    if (redisClient.isOpen) {
      return;
    }
    await redisClient.connect();
  } catch (error) {
    console.error("Failed to connect to Redis", error);
    throw error;
  }
};

export const disconnectRedis = async () => {
  try {
    if (redisClient.isOpen) {
      await redisClient.quit();
    }
  } catch (error) {
    console.error("Failed to disconnect Redis:", error);
    throw error;
  }
};

export const redisHealthCheck = async () => {
  try {
    await redisClient.ping();
    return true;
  } catch (error) {
    console.error("Redis health check failed:", error);
    return false;
  }
};

export default redisClient;
