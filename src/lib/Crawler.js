"use strict";

import request from "request-promise";
import parserUrl from "url";

import blackList from "../../blackList.json";

import Parser from "./Parser";
import ArrayStore from "./ArrayStore";

const MAX_PAGES_TO_VISIT = 500000;

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36",
  Pragma: "no-cache",
  "Accept-Language": "it-IT,it;q=0.8,en-US;q=0.6,en;q=0.4,fr;q=0.2,es;q=0.2",
  "Upgrade-Insecure-Requests": "1",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  keepAlive: "Connection: keep-alive",
  cacheControl: "Cache-Control: no-cache"
};

export default class Crawler {
  constructor(startUrl) {
    this.startUrl = startUrl;
    this.pagesVisited = {};
    this.numPagesVisited = 0;
    this.parser = new Parser();
    this.store = new ArrayStore(this.startUrl);
  }

  async crawl() {
    while (this.store.length > 0) {
      if (this.numPagesVisited >= MAX_PAGES_TO_VISIT) {
        console.log("Max limit of number of pages reached");
        return;
      }

      const nextPage = this.store.shift();

      if (!nextPage) {
        console.log("************** Finish ********************");
        return;
      }

      const hostName = parserUrl.parse(nextPage).hostname;

      if (
        !(nextPage in this.pagesVisited) &&
        blackList.urls.indexOf(hostName) < 0
      ) {
        try {
          await this.visitPage(nextPage);
        } catch (error) {
          console.log(
            error.statusCode +
              " - " +
              (error.response && error.response.statusMessage)
          );
        }
      }
    }
  }

  async visitPage(url) {
    // Add page to our set
    this.pagesVisited[url] = true;
    this.numPagesVisited++;

    // Make the request
    console.log("Visiting page n° " + this.numPagesVisited + ": " + url);

    var options = {
      uri: url,
      headers: HEADERS
    };

    try {
      const html = await request(options);

      const urls = this.parser.parse(html);
      if (urls.length > 0) {
        urls.forEach(url => {
          if (url && url.indexOf("http") > -1) {
            this.store.push(url);
          }
        });
      }
    } catch (error) {
      throw error;
    }
  }
}
