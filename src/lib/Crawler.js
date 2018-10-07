"use strict";

import request from "request";

import Parser from "./Parser";

const MAX_PAGES_TO_VISIT = 50;
const numPagesVisited = 0;
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
    this.pagesToVisit = [this.startUrl];
    this.pagesVisited = {};
    this.numPagesVisited = 0;
    this.parser = new Parser();
  }

  crawl() {
    try {
      if (numPagesVisited >= MAX_PAGES_TO_VISIT) {
        console.log("Max limit of number of pages reached");
        return;
      }

      const nextPage = this.pagesToVisit.pop();
      if (nextPage && !(nextPage in this.pagesVisited)) {
        this.visitPage(nextPage);
      } else {
        console.log("Finish!!!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  visitPage(url) {
    // Add page to our set
    this.pagesVisited[url] = true;
    this.numPagesVisited++;

    // Make the request
    console.log("Visiting page " + url);

    request(
      {
        url: url,
        method: "GET"
        //headers: HEADERS
      },
      (error, response, body) => {
        if (error) {
          throw error;
        }

        if (!response || response.statusCode !== 200) {
          console.log("Response status code: ", response.statusCode);
          return;
        }

        console.log(url + ": " + response.statusCode);

        const anchors = this.parser.parse(body);
        console.log(anchors[112]);
      }
    );
  }
}
