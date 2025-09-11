import logger from "../utils/logger";

/**
 * Factory that creates a URL queue manager for the crawler
 * @param {Object} client - The Redis client to use
 * @returns {Object} - An object with methods to manage the queue
 */
const QueueManager = (client: any) => {
  /**
   * Adds a URL to the queue if it hasn't been visited yet
   * @param {string} url - The URL to add to the queue
   * @returns {Promise<void>}
   */
  const addUrlToQueue = async (url: string) => {
    const isVisited = await client.sIsMember("visitedUrls", url);
    if (!isVisited) {
      const score = Date.now(); // We use the current timestamp as score
      await client.zAdd("urlQueue", { score, value: url });
      logger.info(`URL added: ${url} with score ${score}`);
    } else {
      logger.info(`URL already visited: ${url}`);
    }
  };

  /**
   * Gets and removes the next URL to visit from the queue
   * @returns {Promise<Object|null>} - The URL to visit or null if the queue is empty
   */
  const getNextUrlToVisit = async () => {
    const url = await client.zPopMin("urlQueue");
    if (url) {
      logger.info(`Next URL to visit: ${url.value}`);
      return url;
    } else {
      logger.info("No URLs left to visit.");
      return null;
    }
  };

  /**
   * Marks a URL as visited
   * @param {string} url - The URL to mark as visited
   * @returns {Promise<void>}
   */
  const markUrlAsVisited = async (url: string) => {
    await client.sAdd("visitedUrls", url);
    logger.info(`URL marked as visited: ${url}`);
  };

  /**
   * Closes the Redis connection
   * @returns {Promise<void>}
   */
  const close = async () => {
    try {
      await client.quit();
      logger.info("Redis connection closed.");
    } catch (err) {
      logger.error("Error closing Redis connection:", err);
    }
  };

  return {
    addUrlToQueue,
    getNextUrlToVisit,
    markUrlAsVisited,
    close,
  };
};

export default QueueManager;
