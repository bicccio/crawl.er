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
  constructor(parser, db) {
    if (!(parser && db)) {
      throw new Error("db && Parameters are required");
    }
    this.pagesVisited = {};
    this.numPagesVisited = 0;
    this.parser = parser;
    this.baseUrl = "";

    this.isFetchable = false;
    this.db = db;
    this.currentUrl;
  }

  async crawl() {
    while (true) {
      try {
        if (this.numPagesVisited >= MAX_PAGES_TO_VISIT) {
          logger.info("Max limit of number of pages reached");
          this.finish();
        }

        this.currentUrl = await this.db.findOne({ visited: false });

        if (!this.currentUrl) {
          logger.info("No more page to visit");
          this.finish();
        }

        const nextUrl = this.currentUrl.url;

        const cleanUrl = nextUrl.replace(/\/$/, "");

        const { protocol, hostname } = parserUrl.parse(cleanUrl);

        // const isVisited = await this.db.find({ url: cleanUrl, visited: true });
        // if (isVisited && isVisited.length > 0) {
        //   continue;
        // }

        if (BLACKLIST.indexOf(hostname) > -1) {
          continue;
        }

        if (hostname !== this.baseUrl) {
          this.isFetchable = this.canFetch(cleanUrl, HEADERS["User-Agent"]);
          this.baseUrl = hostname;
          this.protocol = protocol;
        }

        if (!this.isFetchable) continue;

        await this.visitPage(cleanUrl);
      } catch (error) {
        logger.error(this.currentUrl.url);
        logger.error(error);
      }
    }
  }

  async visitPage(url) {
    try {
      const html = await request({
        uri: url,
        headers: HEADERS,
        timeout: REQUEST_TIMEOUT
      });

      this.parser.parse(html);

      const { title, links } = this.parser.getElements();
      this.numPagesVisited++;

      logger.info(`#${this.numPagesVisited}: ${url} - ${title}`);

      await this.db.update(
        { url: url },
        { url: url, title: title, visited: true },
        {}
      );

      if (links.length === 0) return;

      for (const link of links) {
        if (!link) return;

        const cleanUrl = link.replace(/\/$/, "");
        let completeUrl = "";
        if (cleanUrl.indexOf("http") > -1) {
          completeUrl = cleanUrl;
        } else {
          const noLeadingSlashUrl = cleanUrl.replace(/^\/+/g, "");
          completeUrl = `${this.protocol}//${
            this.baseUrl
          }/${noLeadingSlashUrl}`;
        }

        //this.store.push(completeUrl);

        const res = await this.db.find({
          url: completeUrl
        });

        if (res && res.length === 0) {
          // check for blacklist and allowed domains
          const { hostname } = parserUrl.parse(completeUrl);
          if(this.isBlackListed(hostname)) continue
          await this.db.insert({
            url: completeUrl,
            title: "",
            visited: false
          });
        }
      }
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

  isBlackListed(hostname) {
    if (BLACKLIST.indexOf(hostname) > -1) {
      continue;
    }
  }

  finish() {
    logger.info("************** Finish ********************");
    process.exit();
  }
}
