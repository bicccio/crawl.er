import request from "request-promise";
import robots from "robots";

import UrlCleaner from "./urlCleaner";
import logger from "../utils/logger";
import { MAX_PAGES_TO_VISIT, HEADERS, REQUEST_TIMEOUT, BLACKLIST, SLEEP } from "../../config.json";

const crawler = (parser: any, queueManager: any) => {
  let numPagesVisited = 0;
  let baseUrl: string;
  let protocol: string;
  let hostname: string;

  const crawl = async () => {
    try {
      while (numPagesVisited < MAX_PAGES_TO_VISIT) {
        const currentUrl = await queueManager.getNextUrlToVisit();

        if (!currentUrl) {
          logger.info("No more page to visit");
          break;
        }

        // remove trailing slash
        const cleanUrl = currentUrl.value.replace(/\/$/, "");

        // Check if URL is absolute or relative
        let urlInfo: URL;
        let currentHostname: string;
        let currentProtocol: string;
        let finalUrl: string;

        try {
          if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) {
            // Absolute URL
            urlInfo = new URL(cleanUrl);
            currentHostname = urlInfo.hostname;
            currentProtocol = urlInfo.protocol;
          } else {
            // Relative URL - convert to absolute using existing base
            if (!baseUrl || !protocol) {
              logger.warn(`Skipping relative URL ${cleanUrl} - no base URL established`);
              await queueManager.markUrlAsVisited(cleanUrl);
              continue;
            }
            const absoluteUrl = `${protocol}//${baseUrl}${cleanUrl.startsWith("/") ? cleanUrl : "/" + cleanUrl}`;
            urlInfo = new URL(absoluteUrl);
            currentHostname = urlInfo.hostname;
            currentProtocol = urlInfo.protocol;
          }

          // Get the final absolute URL
          finalUrl = urlInfo.toString();
        } catch (error) {
          logger.error(`Invalid URL format: ${cleanUrl}`, error);
          await queueManager.markUrlAsVisited(cleanUrl);
          continue;
        }

        if (currentHostname !== baseUrl) {
          if (BLACKLIST.includes(currentHostname)) {
            logger.info(`${cleanUrl} black listed`);
            await queueManager.markUrlAsVisited(cleanUrl);
            continue;
          }

          try {
            const fetchable = await canFetch(finalUrl, HEADERS["User-Agent"]);
            if (!fetchable) {
              logger.info(`${finalUrl} not fetchable`);
              await queueManager.markUrlAsVisited(finalUrl);
              continue;
            }
          } catch (error) {
            logger.error(`Error checking robots.txt for ${finalUrl}`, error);
            await queueManager.markUrlAsVisited(finalUrl);
            continue;
          }

          baseUrl = currentHostname!;
          hostname = currentHostname!;
          protocol = currentProtocol!;
        }

        try {
          await visit(finalUrl);

          if (SLEEP > 0) {
            await sleep(SLEEP);
          }
        } catch (error: any) {
          await queueManager.markUrlAsVisited(cleanUrl);
          logger.error(JSON.stringify({ url: cleanUrl, error: error.message }));
        }
      }
      if (numPagesVisited >= MAX_PAGES_TO_VISIT) {
        logger.info(`Max number of pages limit reached (${MAX_PAGES_TO_VISIT})`);
      }
    } catch (error) {
      logger.error("Critical error during crawling process", error);
    } finally {
      await finish();
    }
  };

  const visit = async (url: string) => {
    const html = await request({
      uri: url,
      headers: HEADERS as unknown as Headers,
      timeout: REQUEST_TIMEOUT,
    });

    parser.parse(html);

    const { title, links } = parser.getElements();
    numPagesVisited++;

    logger.info(`#${numPagesVisited}: ${url} - ${title}`);
    await queueManager.markUrlAsVisited(url); // Assicurati di segnare come visitato solo se effettivamente lo visiti

    await updateLinks(links);
  };

  const updateLinks = async (links: string[]) => {
    if (links.length === 0) return;

    for (const link of links) {
      if (!link) continue;

      const { clean: cleanUrl } = UrlCleaner();
      const completeUrl = cleanUrl(link, hostname, protocol);

      if (BLACKLIST.includes(hostname)) continue;

      await queueManager.addUrlToQueue(completeUrl);
    }
  };

  const canFetch = async (url: string, userAgent: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      try {
        const parser = new robots.RobotsParser(`${protocol}//${hostname}/robots.txt`);
        parser.canFetch(userAgent, url, (access: boolean) => {
          resolve(access);
        });
      } catch (error) {
        reject(error);
      }
    });
  };

  const finish = async () => {
    logger.info("************** Finish ********************");
    await queueManager.close(); // Chiudi correttamente la connessione Redis
    process.exit(0);
  };

  const sleep = (ms: number) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  };

  return {
    crawl,
  };
};

export default crawler;
