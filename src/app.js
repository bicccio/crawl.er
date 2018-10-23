import Crawler from "./lib/Crawler";
import InMemoryStore from "./lib/InMemoryStore";
import Parser from "./lib/Parser";
import logger from "./lib/log";
import { START_URLS } from "../assets/config.json";

const urls = process.argv[2]
  ? Array.prototype.concat([], process.argv[2])
  : START_URLS;

const crawler = new Crawler(new Parser(), new InMemoryStore(urls));

try {
  crawler.crawl();
} catch (e) {
  logger.error(e);
}
