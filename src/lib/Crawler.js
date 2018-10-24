"use strict";

import request from "request-promise";
import parserUrl from "url";
import Datastore from "nedb-promises";
import robots from "robots";
import { MAX_PAGES_TO_VISIT, HEADERS, REQUEST_TIMEOUT, BLACKLIST } from "../../conf/config.json";
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
    this.db = new Datastore({ filename: "./db" });
  }

  async crawl() {
    while (this.store.length() > 0) {
      if (this.numPagesVisited >= MAX_PAGES_TO_VISIT) {
        logger.info("Max limit of number of pages reached");
        this.finish();
      }

      let nextUrl = this.store.shift();
      if (!nextUrl) {
        logger.info("No more page to visit");
        this.finish();
      }

      const cleanUrl = nextUrl.replace(/\/$/, "");

      const { protocol, hostname } = parserUrl.parse(cleanUrl);

      if (this.pagesVisited[cleanUrl] || BLACKLIST.indexOf(hostname) > -1) {
        continue;
      }

      try {
        if (hostname !== this.baseUrl) {
          this.isFetchable = this.canFetch(cleanUrl, HEADERS["User-Agent"]);
          this.baseUrl = hostname;
          this.protocol = protocol;
        }

        if (!this.isFetchable) continue;

        await this.visitPage(cleanUrl);
      } catch (error) {
        throw error;
      }
    }

    this.finish();
  }

  finish() {
    logger.info("************** Finish ********************");
    process.exit();
  }

  async visitPage(url) {
    try {
      const html = await request({
        uri: url,
        headers: HEADERS,
        timeout: REQUEST_TIMEOUT
      });

      this.parser.parse(html);

      const title = this.parser.getTitle();
      this.numPagesVisited++;

      logger.info(`#${this.numPagesVisited}: ${title} (${url})`);
      this.db.insert({ url: url, title: title });

      const links = this.parser.getLinks();
      if (links.length === 0) return;

      links.forEach(link => {
        if (!link) return;

        const cleanUrl = link.replace(/\/$/, "");

        if (cleanUrl.indexOf("http") > -1) {
          this.store.push(cleanUrl);
        } else {
          const noLeadingSlashUrl = cleanUrl.replace(/^\/+/g, "");
          this.store.push(`${this.protocol}//${this.baseUrl}/${noLeadingSlashUrl}`);
        }
      });
    } catch (error) {
      cra;
    }
  }

  canFetch(url, userAgent) {
    const { hostname, protocol } = parserUrl.parse(url);

    const parser = new robots.RobotsParser(`${protocol}//"${hostname}/robots.txt`);

    return parser.canFetchSync(userAgent, url);
  }
}
