import Parser from "../lib/cheerioParser";
import Crawler from "../lib/crawler";
import { createClient } from "redis";
import { START_URLS, BLACKLIST } from "../../config.json";
import logger from "../lib/logger";
import QueueManagerFactory from "../lib/queueManager";

/**
 * Configures the crawler with Redis and returns a ready-to-use instance
 */
export async function setupCrawler() {
  const initialUrls = process.argv[2] ? [process.argv[2]] : START_URLS;
  const redisClient = await setupRedisClient();

  await initializeUrlQueue(redisClient, initialUrls);

  return Crawler(Parser(), redisClient);
}

/**
 * Configures the Redis client and initializes the URL queue
 */
async function setupRedisClient() {
  const redisClient = createClient();
  redisClient.on("error", (err) => logger.error("Redis client error", err));

  await redisClient.connect();

  return redisClient;
}

/**
 * Initializes the URL queue with the provided URLs
 */
async function initializeUrlQueue(redisClient, urls) {
  try {
    // Inizializziamo QueueManager con il client Redis
    const queueManager = QueueManagerFactory(redisClient);

    await Promise.all(
      urls.map(async (url) => {
        const cleanUrl = url.replace(/\/$/, ""); // Remove trailing slash
        const urlObject = new URL(url);

        if (BLACKLIST.includes(urlObject.hostname)) return;

        // Utilizziamo queueManager senza passare il client ogni volta
        return await queueManager.addUrlToQueue(cleanUrl);
      })
    );
  } catch (err) {
    logger.error(err);
  }

  return redisClient;
}
