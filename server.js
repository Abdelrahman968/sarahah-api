import { API_PREFIX, PORT } from "./config/env.config.js";
import app from "./src/app.js";
import { connectDB, disconnectDB } from "./src/db/connection.db.js";
import { connectRedis, disconnectRedis } from "./src/db/redis.client.js";

const startServer = async () => {
  try {
    await connectRedis();
    await connectDB();

    const server = app.listen(PORT, () =>
      console.log(`Server is running on port ${PORT}${API_PREFIX}`),
    );

    const shutdown = async (signal) => {
      console.log(`${signal} received. Shutting down...`);

      server.close(async () => {
        const results = await Promise.allSettled([
          disconnectRedis(),
          disconnectDB(),
        ]);

        results.forEach((result) => {
          if (result.status === "rejected") {
            console.error("Shutdown error:", result.reason);
          }
        });

        process.exit(
          results.some((result) => result.status === "rejected") ? 1 : 0,
        );
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("Server failed to start:", error);
    process.exit(1);
  }
};

startServer();
