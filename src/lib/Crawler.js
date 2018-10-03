"use strict";

import request from "request";
import URL from "url-parse";
import fs from "fs";
import _ from "underscore";

import Parser from "./SimpleRecursor";

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
    // this.url = new URL(this.startUrl);
    // this.maxPageToVisit = 50;
    // this.baseUrl = this.url.protocol + "//" + this.url.hostname;
    // this.file = fs.createWriteStream('urls.txt');

    this.pagesToVisit = [];
    this.pagesToVisit.push(this.startUrl);
    this.pagesVisited = {};
    this.numPagesVisited = 0;
  }

  crawl() {
    if (numPagesVisited >= MAX_PAGES_TO_VISIT) {
      console.log("Reached max limit of number of pages to visit.");
      return;
    }

    let nextPage = this.pagesToVisit.pop();
    if (nextPage) {
      // savePageToVisit(pagesToVisit);
      if (nextPage in this.pagesVisited) {
        // If you want to go deep and crawl subpages
        // this.crawl();
      } else {
        this.visitPage(nextPage, this.crawl.bind(this));
      }
    } else {
      console.log("Finish!!!");
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
        headers: HEADERS
      },
      (error, response, body) => {
        if (error) {
          console.log(error);
          return;
        }

        if (!response || response.statusCode !== 200) {
          console.log("Response status code: ", response.statusCode);
          // If you want to go deep and crawl subpages
          // callback();
          return;
        }

        console.log(url + ": " + response.statusCode);
        let parser = new Parser();
        let result = parser.parse(body);
        // res.setHeader("Content-Type", "application/json");
        // res.send(JSON.stringify(result));

        // If you want to go deep and crawl subpages
        // callback();
      }
    );
  }

  //parse() {}

  //fakerequest(options, body) {}
}
