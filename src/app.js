import Crawler from "./lib/Crawler";
import ArrayStore from "./lib/ArrayStore";
import Parser from "./lib/Parser";
import logger from "./lib/log";

let url = "https://news.ycombinator.com/";

if (process.argv[2]) {
  url = process.argv[2];
}

const store = new ArrayStore(url);
const parser = new Parser();
const crawler = new Crawler(parser, store);

try {
  crawler.crawl();
} catch (e) {
  logger.error(e);
}
