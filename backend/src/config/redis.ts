import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const connection = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

connection.on("error", (err) => {
  console.error("Redis connection error:", err);
});

connection.on("connect", () => {
  console.log("Redis connected successfully");
});

connection.on("reconnecting", () => {
  console.log("Redis reconnecting...");
});

const redisConfig = { connection };

export default redisConfig;
