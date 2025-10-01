import { createClient } from "redis";
import Parser from "../lib/parsers/cheerioParser";
import Crawler from "../lib/crawler";
import { SEED_URLS, BLACKLIST, REDIS } from "../../config.json";
import logger from "../utils/logger";
import QueueManagerFactory from "../lib/queueManager";

/**
 * Configures the crawler with Redis and returns a ready-to-use instance
 */
export async function setupCrawler() {
  const seed = process.argv[2] ? [process.argv[2]] : SEED_URLS;
  const redisClient = await setupRedisClient();
  const queueManager = await initializeUrlQueue(redisClient, seed);
  const parser = Parser();

  return Crawler(parser, queueManager);
}

/**
 * Configures the Redis client and initializes the URL queue
 */
async function setupRedisClient() {
  const redisClient = createClient({
    socket: {
      host: REDIS.host,
      port: REDIS.port,
    },
    password: REDIS.password,
  });

  redisClient.on("error", (err) => {
    logger.error("Redis client error", err);
    process.exit(1);
  });

  await redisClient.connect();
  logger.info("Successfully connected to Redis");

  return redisClient;
}

/**
 * Initializes the URL queue with the provided URLs
 */
async function initializeUrlQueue(redisClient: any, urls: string[]) {
  // Inizializziamo QueueManager con il client Redis
  const queueManager = QueueManagerFactory(redisClient);

  try {
    await Promise.all(
      urls.map(async (url) => {
        // forse la pulizie delle URL andrebbe fatta nel queueManager
        // e non qui
        const cleanUrl = url.replace(/\/$/, ""); // Remove trailing slash
        const urlObject = new URL(url);

        if (BLACKLIST.includes(urlObject.hostname)) return;

        return queueManager.addUrlToQueue(cleanUrl);
      })
    );

    return queueManager;
  } catch (err) {
    logger.error("Error initializing URL queue:", err);
    // Restituiamo comunque il queueManager invece del redisClient
    return queueManager;
  }
}
