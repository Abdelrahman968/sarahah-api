import { API_PREFIX, PORT } from "./config/env.config.js";
import app from "./src/app.js";
import { connectDB, disconnectDB } from "./src/db/connection.db.js";

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () =>
      console.log(`Server is running on port ${PORT}${API_PREFIX}`),
    );

    const shutdown = async (signal) => {
      console.log(`${signal} received. Shutting down...`);

      server.close(async () => {
        await disconnectDB();
        process.exit(0);
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
