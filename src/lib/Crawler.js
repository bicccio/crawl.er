"use strict";

import request from "request-promise";
import parserUrl from "url";
import robots from "robots";
import {
  MAX_PAGES_TO_VISIT,
  HEADERS,
  REQUEST_TIMEOUT,
  BLACKLIST
} from "../../conf/config.json";
import logger from "./log";

export default class Crawler {
  constructor(parser, store) {
    if (!(parser && store)) {
      throw new Error("Store && Parameters are required");
    }
    this.pagesVisited = {};
    this.numPagesVisited = 0;
    this.parser = parser;
    this.store = store;
    this.baseUrl = "";

    this.isFetchable = false;
  }

  async crawl() {
    while (this.store.length() > 0) {
      if (this.numPagesVisited >= MAX_PAGES_TO_VISIT) {
        logger.info("Max limit of number of pages reached");
        this.finish();
      }

      const nextUrl = this.store.shift();
      if (!nextUrl) {
        logger.info("No more page to visit");
        this.finish();
      }

      const cleanUrl = nextUrl.replace(/\/$/, "");

      const { protocol, hostname } = parserUrl.parse(cleanUrl);

      if (this.pagesVisited[cleanUrl] || BLACKLIST.indexOf(hostname) > -1) {
        //logger.warn(`${cleanUrl} visited or black listed`);
        continue;
      }

      try {
        if (hostname !== this.baseUrl) {
          this.isFetchable = this.canFetch(cleanUrl, HEADERS["User-Agent"]);
          this.baseUrl = hostname;
          this.protocol = protocol;
          //logger.info(`\n\n************** ${hostname} ********************\n`);
        }
        if (this.isFetchable) await this.visitPage(cleanUrl);
      } catch (error) {
        // if (error.name && error.statusCode)
        //   logger.error(
        //     `Error visitind ${cleanUrl}: ${error.name} - ${error.statusCode}`
        //   );
      }
    }

    this.finish();
  }

  finish() {
    logger.info("************** Finish ********************");
    process.exit();
  }

  async visitPage(url) {
    this.pagesVisited[url] = true;
    this.numPagesVisited++;

    const options = {
      uri: url,
      headers: HEADERS,
      timeout: REQUEST_TIMEOUT
    };

    try {
      const html = await request(options);

      this.parser.parse(html);

      logger.info(
        `#${this.numPagesVisited}: ${this.parser.getTitle()} (${url})`
      );

      const links = this.parser.getLinks();
      if (links.length === 0) return;

      links.forEach(link => {
        if (!link) return;

        const cleanUrl = link.replace(/\/$/, "");

        if (cleanUrl.indexOf("http") > -1) {
          this.store.push(cleanUrl);
        } else {
          const noLeadingSlashUrl = cleanUrl.replace(/^\/+/g, "");
          this.store.push(
            `${this.protocol}//${this.baseUrl}/${noLeadingSlashUrl}`
          );
        }
      });
    } catch (error) {
      throw error;
    }
  }

  canFetch(url, userAgent) {
    const { hostname, protocol } = parserUrl.parse(url);

    const parser = new robots.RobotsParser(
      `${protocol}//"${hostname}/robots.txt`
    );

    return parser.canFetchSync(userAgent, url);
  }
}
