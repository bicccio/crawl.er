import Crawler from "./lib/Crawler";
import ArrayStore from "./lib/ArrayStore";
import Parser from "./lib/Parser";
import logger from "./lib/log";
import config from "../config.json";

const url = process.argv[2] ? process.argv[2] : config.DEFAULT_URL;

const crawler = new Crawler(new Parser(), ArrayStore(url));

try {
  crawler.crawl();
} catch (e) {
  logger.error(e);
}
