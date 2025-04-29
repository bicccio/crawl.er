import request from "request-promise";
import parserUrl from "url";
import UrlCleaner from "./urlCleaner";
import robots from "robots";
import { MAX_PAGES_TO_VISIT, HEADERS, REQUEST_TIMEOUT, BLACKLIST, SLEEP } from "../../config.json";
import logger from "./logger";
import QueueManagerFactory from "./queueManager";

const crawler = (parser, client) => {
  let numPagesVisited = 0,
    baseUrl,
    protocol,
    hostname;

  const queueManager = QueueManagerFactory(client);

  const crawl = async () => {
    let currentUrl;

    while (numPagesVisited < MAX_PAGES_TO_VISIT) {
      try {
        currentUrl = await queueManager.getNextUrlToVisit();

        if (!currentUrl) {
          logger.info("No more page to visit");
          finish();
        }

        // remove leading slash
        const cleanUrl = currentUrl.value.replace(/\/$/, "");
        ({ hostname, protocol } = parserUrl.parse(cleanUrl));

        if (hostname !== baseUrl) {
          if (BLACKLIST.includes(hostname)) {
            logger.info(`${cleanUrl} black listed`);
            await queueManager.markUrlAsVisited(cleanUrl);
            continue;
          }

          if (!canFetch(cleanUrl, HEADERS["User-Agent"])) {
            logger.info(`${cleanUrl} not fetchable`);
            await queueManager.markUrlAsVisited(cleanUrl);
            continue;
          }

          baseUrl = hostname;
        }

        await visit(cleanUrl);

        SLEEP > 0 && (await sleep(SLEEP));
      } catch (error) {
        if (currentUrl?.value) {
          await queueManager.markUrlAsVisited(currentUrl.value); // Assicurati di segnare come visitato solo se effettivamente lo visiti
          logger.error(JSON.stringify({ url: currentUrl.value, error }));
        }
        logger.error("Error while crawling", error);
      }
    }

    logger.info(`Max number of pages limit reached (${MAX_PAGES_TO_VISIT})`);
    finish();
  };

  const visit = async (url) => {
    const html = await request({
      uri: url,
      headers: HEADERS,
      timeout: REQUEST_TIMEOUT,
    });

    parser.parse(html);

    const { title, links } = parser.getElements();
    numPagesVisited++;

    logger.info(`#${numPagesVisited}: ${url} - ${title}`);
    await queueManager.markUrlAsVisited(url); // Assicurati di segnare come visitato solo se effettivamente lo visiti

    await updateLinks(links);
  };

  const updateLinks = async (links) => {
    if (links.length === 0) return;

    for (const link of links) {
      if (!link) continue;

      const { clean: cleanUrl } = UrlCleaner();
      const completeUrl = cleanUrl(link, hostname, protocol);

      if (BLACKLIST.includes(hostname)) continue;

      await queueManager.addUrlToQueue(completeUrl);
    }
  };

  const canFetch = async (url, userAgent) => {
    return new Promise((resolve) => {
      const parser = new robots.RobotsParser(`${protocol}//${hostname}/robots.txt`);
      parser.canFetch(userAgent, url, (access) => {
        resolve(access);
      });
    });
  };

  const finish = async () => {
    logger.info("************** Finish ********************");
    try {
      await client.quit(); // Chiudi correttamente la connessione Redis
      logger.info("Redis connection closed");
    } catch (err) {
      logger.error("Error closing Redis connection", err);
    }
    process.exit(0);
  };

  const sleep = (ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  };

  return {
    crawl,
  };
};

export default crawler;
