import request from "request-promise";
import parserUrl from "url";
import UrlCleaner from "./UrlCleaner";
import robots from "robots";
import { MAX_PAGES_TO_VISIT, HEADERS, REQUEST_TIMEOUT, BLACKLIST, SLEEP } from "../../conf/config.json";
import logger from "./log";

export default (parser, client) => {
  async function addUrlToQueue(url) {
    const isVisited = await client.sIsMember("visitedUrls", url);
    if (!isVisited) {
      const score = Date.now(); // Usiamo il timestamp corrente come punteggio
      await client.zAdd("urlQueue", { score, value: url });
      console.log(`URL aggiunto: ${url} con punteggio ${score}`);
    } else {
      console.log(`URL già visitato: ${url}`);
    }
  }

  async function getNextUrlToVisit() {
    const url = await client.zPopMin("urlQueue");
    if (url) {
      console.log(`Prossimo URL da visitare: ${url.value}`);
      return url;
    } else {
      console.log("Nessun URL rimasto da visitare.");
      return null;
    }
  }

  async function markUrlAsVisited(url) {
    await client.sAdd("visitedUrls", url);
    console.log(`URL marcato come visitato: ${url}`);
  }

  if (!(parser && client)) {
    throw new Error("client & Parser are required");
  }

  let numPagesVisited = 0,
    baseUrl,
    protocol,
    hostname;

  const crawl = async () => {
    let currentUrl;

    while (numPagesVisited < MAX_PAGES_TO_VISIT) {
      try {
        currentUrl = await getNextUrlToVisit();

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
            await markUrlAsVisited(cleanUrl);
            continue;
          }

          if (!canFetch(cleanUrl, HEADERS["User-Agent"])) {
            logger.info(`${cleanUrl} not fetchable`);
            await markUrlAsVisited(cleanUrl);
            continue;
          }

          baseUrl = hostname;
        }

        await visit(cleanUrl);

        SLEEP > 0 && (await sleep(SLEEP));
      } catch (error) {
        await markUrlAsVisited(currentUrl.value); // Assicurati di segnare come visitato solo se effettivamente lo visiti
        logger.error(JSON.stringify({ url: currentUrl.value, error }));
      }
    }

    logger.info("Max number of pages limit reached");
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
    await markUrlAsVisited(url); // Assicurati di segnare come visitato solo se effettivamente lo visiti

    await updateLinks(links);
  };

  const updateLinks = async (links) => {
    if (links.length === 0) return;

    for (const link of links) {
      if (!link) return;

      const { clean: cleanUrl } = UrlCleaner();
      const completeUrl = cleanUrl(link, hostname, protocol);

      if (BLACKLIST.includes(hostname)) continue;

      await addUrlToQueue(completeUrl);
    }
  };

  const canFetch = (url, userAgent) => {
    const parser = new robots.RobotsParser(`${protocol}//${hostname}/robots.txt`);

    const res = parser.canFetchSync(userAgent, url);
    return res;
  };

  const finish = () => {
    logger.info("************** Finish ********************");
    process.exit();
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
