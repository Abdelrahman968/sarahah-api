import { checkDBHealth } from "../../db/connection.db.js";

export const checkHealthService = async () => {
  const database = await checkDBHealth();

  if (!database) {
    throw new Error(
      "Database is not healthy, please check the database connection",
      {
        cause: {
          status: 503,
          service: "database",
        },
      },
    );
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
    },
    uptime: formattedUptime,
    timestamp: new Date().toISOString(),
  };
};
