import { checkDBHealth } from "../../db/connection.db.js";
import { redisHealthCheck } from "../../db/redis.client.js";
import userRepository from "../../db/repository/user.repository.js";

export const checkHealthService = async () => {
  const database = await checkDBHealth();
  const redis = await redisHealthCheck();

  if (!database) {
    throw new Error(
      "Database is not healthy, please check the database connection",
      {
        cause: {
          status: 503,
          service: "Mongo DB",
        },
      },
    );
  }

  if (!redis) {
    throw new Error("Redis is not healthy, please check the Redis connection", {
      cause: {
        status: 503,
        service: "Redis",
      },
    });
  }

  const uptime = Math.floor(process.uptime());

  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = uptime % 60;

  const formattedUptime = [hours, minutes, seconds]
    .map((unit) => String(unit).padStart(2, "0"))
    .join(":");

  return {
    success: true,
    message: "API is healthy and running",
    services: {
      api: "up",
      database: "up",
      redis: "up",
    },
    uptime: formattedUptime,
    timestamp: new Date().toISOString(),
  };
};

export const GetAllUsersService = async () => {
  return userRepository.findAll();
};
