import request from "request-promise";
import parserUrl from "url";
import robots from "robots";
import { MAX_PAGES_TO_VISIT, HEADERS, REQUEST_TIMEOUT, BLACKLIST, SLEEP } from "../../conf/config.json";
import logger from "./log";

export default (parser, store) => {
  if (!(parser && store)) {
    throw new Error("store && Parser are required");
  }

  let numPagesVisited = 0,
    baseUrl = "",
    isFetchable = false,
    currentUrl,
    protocol,
    hostname;

  const crawl = async () => {
    while (true) {
      try {
        if (numPagesVisited >= MAX_PAGES_TO_VISIT) {
          logger.info("Max limit of number of pages reached");
          finish();
        }

        currentUrl = await store.findNotVisited({ visited: false });

        if (!currentUrl) {
          logger.info("No more page to visit");
          finish();
        }

        // remove leading slash
        const cleanUrl = currentUrl.url.replace(/\/$/, "");

        ({ protocol, hostname } = parserUrl.parse(cleanUrl));

        if (isBlackListed(hostname)) continue;

        if (hostname !== baseUrl) {
          isFetchable = canFetch(cleanUrl, HEADERS["User-Agent"]);
          if (!isFetchable) continue;
          baseUrl = hostname;
        }

        await visitPage(cleanUrl);

        SLEEP > 0 && (await sleep(SLEEP));
      } catch (error) {
        await store.update(currentUrl.url, "", true);

        logger.error({ url: currentUtl.url, error });
      }
    }
  };

  const visitPage = async url => {
    try {
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

      if (links.length === 0) return;

      for (const link of links) {
        if (!link) return;

        const cleanUrl = link.replace(/\/$/, "");
        let completeUrl = "";

        if (cleanUrl.indexOf("http") > -1) {
          completeUrl = cleanUrl;
        } else {
          const noLeadingSlashUrl = cleanUrl.replace(/^\/+/g, "");
          const searchPattern = new RegExp("^//");
          completeUrl = searchPattern.test(cleanUrl)
            ? (completeUrl = `${protocol}//${noLeadingSlashUrl}`)
            : (completeUrl = `${protocol}//${baseUrl}/${noLeadingSlashUrl}`);
        }

        const res = await store.findByUrl(completeUrl);

        if (res) {
          const { hostname } = parserUrl.parse(completeUrl);

          if (isBlackListed(hostname)) continue;

          await store.insert(completeUrl, "", false);
        }
      }
    } catch (error) {
      throw error;
    }
  };

  const canFetch = (url, userAgent) => {
    const { hostname, protocol } = parserUrl.parse(url);

    const parser = new robots.RobotsParser(`${protocol}//${hostname}/robots.txt`);

    return parser.canFetchSync(userAgent, url);
  };

  const isBlackListed = hostname => {
    return BLACKLIST.indexOf(hostname) > -1;
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
