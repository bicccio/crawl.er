"use strict";

import request from "request-promise";
import parserUrl from "url";
import robots from "robots";
import blackList from "../../assets/black_list.json";
import { MAX_PAGES_TO_VISIT, HEADERS } from "../../assets/config.json";
import logger from "./log";

export default class Crawler {
  constructor(parser, store) {
    this.pagesVisited = {};
    this.numPagesVisited = 0;
    this.parser = parser;
    this.store = store;
    this.baseUrl = "";
  }

  async crawl() {
    if (!this.store) {
      this.finish();
    }

    while (this.store.length() > 0) {
      if (this.numPagesVisited >= MAX_PAGES_TO_VISIT) {
        logger.info("Max limit of number of pages reached");
        this.finish();
      }

      const nextPage = this.store.shift();

      if (!nextPage) {
        this.finish();
      }

      const hostname = parserUrl.parse(nextPage).hostname;

      if (
        nextPage in this.pagesVisited ||
        blackList.urls.indexOf(hostname) > -1
      )
        continue;

      try {
        if (hostname !== this.baseUrl) {
          this.isFetchable = this.canFetch(nextPage, HEADERS["User-Agent"]);
          this.baseUrl = hostname;

          logger.info(`\n************** ${hostname} ********************\n`);
        }
        if (this.isFetchable) await this.visitPage(nextPage);
      } catch (error) {
        if (error.name && error.statusCode)
          logger.error(`Error: ${error.name} - ${error.statusCode}`);
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
      headers: HEADERS
    };

    try {
      const html = await request(options);

      this.parser.parse(html);

      logger.info(
        `#${this.numPagesVisited}: ${this.parser.getTitle()} (${url})`
      );

      const links = this.parser.getLinks();
      if (links.length === 0) return;

      links.forEach(url => {
        if (url && url.indexOf("http") > -1) {
          this.store.push(url);
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
