import request from "request-promise";
import parserUrl from "url";
import UrlCleaner from "./UrlCleaner";
import robots from "robots";
import {
  MAX_PAGES_TO_VISIT,
  HEADERS,
  REQUEST_TIMEOUT,
  BLACKLIST,
  SLEEP
} from "../../conf/config.json";
import logger from "./log";

export default (parser, store) => {
  if (!(parser && store)) {
    throw new Error("store & Parser are required");
  }

  let numPagesVisited = 0,
    baseUrl,
    protocol,
    hostname;

  const crawl = async () => {
    let currentUrl;

    while (numPagesVisited < MAX_PAGES_TO_VISIT) {
      try {
        currentUrl = await store.findNotVisited();

        if (!currentUrl) {
          logger.info("No more page to visit");
          finish();
        }

        // remove leading slash
        const cleanUrl = currentUrl.url.replace(/\/$/, "");
        ({ hostname, protocol } = parserUrl.parse(cleanUrl));

        if (hostname !== baseUrl) {
          if (BLACKLIST.includes(hostname)) {
            await store.update(cleanUrl, "", true);
            logger.info(`${cleanUrl} black listed`);
            continue;
          }

          if (!canFetch(cleanUrl, HEADERS["User-Agent"])) {
            await store.update(cleanUrl, "", true);
            logger.info(`${cleanUrl} not fetchable`);
            continue;
          }

          baseUrl = hostname;
        }

        await visitPage(cleanUrl);

        SLEEP > 0 && (await sleep(SLEEP));
      } catch (error) {
        await store.update(currentUrl.url, "", true);
        logger.error(JSON.stringify({ url: currentUrl.url, error }));
      }
    }

    logger.info("Max number of pages limit reached");
  };

  const visitPage = async url => {
    const html = await request({
      uri: url,
      headers: HEADERS,
      timeout: REQUEST_TIMEOUT
    });

    parser.parse(html);

    const { title, links } = parser.getElements();
    numPagesVisited++;

    logger.info(`#${numPagesVisited}: ${url} - ${title}`);

    await store.update(url, title, true);

    await updateLinks(links);
  };

  const updateLinks = async links => {
    if (links.length === 0) return;

    for (const link of links) {
      if (!link) return;

      const { clean: cleanUrl } = UrlCleaner();
      const completeUrl = cleanUrl(link, hostname, protocol);

      const res = await store.findByUrl(completeUrl);

      if (!res) {
        if (BLACKLIST.includes(hostname)) continue;

        await store.insert(completeUrl, "", false);
      }
    }
  };

  const canFetch = (url, userAgent) => {
    const parser = new robots.RobotsParser(
      `${protocol}//${hostname}/robots.txt`
    );

    return parser.canFetchSync(userAgent, url);
  };

  const finish = () => {
    logger.info("************** Finish ********************");
    process.exit();
  };

  const sleep = ms => {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  };

  return {
    crawl
  };
};
