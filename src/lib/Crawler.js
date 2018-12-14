"use strict";

import request from "request-promise";
import parserUrl from "url";
import robots from "robots";
import { MAX_PAGES_TO_VISIT, HEADERS, REQUEST_TIMEOUT, BLACKLIST, SLEEP } from "../../conf/config.json";
import logger from "./log";

export default (parser, db) => {
  if (!(parser && db)) {
    throw new Error("db && Parameters are required");
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

        currentUrl = await db.findOne({ visited: false });

        if (!currentUrl) {
          logger.info("No more page to visit");
          finish();
        }

        const cleanUrl = currentUrl.url.replace(/\/$/, "");

        ({ protocol, hostname } = parserUrl.parse(cleanUrl));

        const isVisited = await db.find({ url: cleanUrl, visited: true });
        if (isVisited && isVisited.length > 0) {
          continue;
        }

        if (BLACKLIST.indexOf(hostname) > -1) {
          continue;
        }

        if (hostname !== baseUrl) {
          isFetchable = canFetch(cleanUrl, HEADERS["User-Agent"]);
          baseUrl = hostname;
        }

        if (!isFetchable) continue;

        await visitPage(cleanUrl);

        SLEEP > 0 && (await sleep(SLEEP));
      } catch (error) {
        logger.error(currentUrl.url);

        await db.update({ url: currentUrl.url }, { url: currentUrl.url, title: "", visited: true }, {});

        logger.error(error);
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

      await db.update({ url: url }, { url: url, title: title, visited: true }, {});

      if (links.length === 0) return;

      for (const link of links) {
        if (!link) return;

        const cleanUrl = link.replace(/\/$/, "");
        let completeUrl = "";
        const searchPattern = new RegExp("^//");
        if (cleanUrl.indexOf("http") > -1) {
          completeUrl = cleanUrl;
        } else {
          const noLeadingSlashUrl = cleanUrl.replace(/^\/+/g, "");
          completeUrl = searchPattern.test(cleanUrl)
            ? (completeUrl = `${protocol}//${noLeadingSlashUrl}`)
            : (completeUrl = `${protocol}//${baseUrl}/${noLeadingSlashUrl}`);
        }

        const res = await db.find({
          url: completeUrl
        });

        if (res && res.length === 0) {
          // check for blacklist and allowed domains
          const { hostname } = parserUrl.parse(completeUrl);

          if (isBlackListed(hostname)) continue;

          await db.insert({
            url: completeUrl,
            title: "",
            visited: false
          });
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
