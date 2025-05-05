import { createClient } from "redis";
import Parser from "../lib/Parsers/cheerioParser";
import Crawler from "../lib/crawler";
import { START_URLS, BLACKLIST } from "../../config.json";
import logger from "../utils/logger";
import QueueManagerFactory from "../lib/queueManager";

/**
 * Configures the crawler with Redis and returns a ready-to-use instance
 */
export async function setupCrawler() {
  const initialUrls = process.argv[2] ? [process.argv[2]] : START_URLS;
  const redisClient = await setupRedisClient();
  const queueManager = await initializeUrlQueue(redisClient, initialUrls);
  const parser = Parser();

  return Crawler(parser, queueManager);
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
async function initializeUrlQueue(redisClient: any, urls: string[]) {
  try {
    // Inizializziamo QueueManager con il client Redis
    const queueManager = QueueManagerFactory(redisClient);

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
    logger.error(err);
  }

  return redisClient;
}
