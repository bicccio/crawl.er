import Parser from "../lib/Parser";
import Crawler from "../lib/Crawler";
import { createClient } from "redis";
import { START_URLS, BLACKLIST } from "../../config.json";
import logger from "../lib/log";
import QueueManager from "../lib/QueueManager";

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
    await Promise.all(
      urls.map(async (url) => {
        const cleanUrl = url.replace(/\/$/, ""); // Remove trailing slash
        const urlObject = new URL(url);

        if (BLACKLIST.includes(urlObject.hostname)) return;

        return await QueueManager.addUrlToQueue(redisClient, cleanUrl);
      })
    );
  } catch (err) {
    logger.error(err);
  }

  return redisClient;
}
