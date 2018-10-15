"use strict";

import request from "request-promise";
import parserUrl from "url";
import robots from "robots";
const robotsParser = new robots.RobotsParser();
import blackList from "../../blackList.json";
import config from "../../config.json";

export default class Crawler {
  constructor(parser, store) {
    this.pagesVisited = {};
    this.numPagesVisited = 0;
    this.parser = parser;
    this.store = store;
  }

  async crawl() {
    while (this.store.length() > 0) {
      if (this.numPagesVisited >= config.MAX_PAGES_TO_VISIT) {
        console.log("Max limit of number of pages reached");
        return;
      }

      const nextPage = this.store.shift();

      if (!nextPage) {
        console.log("************** Finish ********************");
        return;
      }

      const hostname = parserUrl.parse(nextPage).hostname;

      if (nextPage in this.pagesVisited || blackList.urls.indexOf(hostname) > -1) return;

      let canFetch = false;
      try {
        canFetch = await this.canFetch(nextPage, config.HEADERS["User-Agent"]);
      } catch (e) {
        canFetch = false;
      }

      try {
        if (canFetch) await this.visitPage(nextPage);
      } catch (error) {
        console.log(error);
      }
    }
  }

  async visitPage(url) {
    // Add page to our set
    this.pagesVisited[url] = true;
    this.numPagesVisited++;

    console.log("Visiting page n° " + this.numPagesVisited + ": " + url);

    var options = {
      uri: url,
      headers: config.HEADERS
    };

    try {
      const html = await request(options);

      this.parser.parse(html);
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
    const robotsUrl = protocol + "//" + hostname + "/robots.txt";

    return new Promise((resolve, reject) => {
      robotsParser.setUrl(robotsUrl, (parser, success) => {
        if (success) {
          parser.canFetch(userAgent, url, access => {
            resolve(access);
          });
        } else {
          reject(false);
        }
      });
    });
  }
}
