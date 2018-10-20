import Crawler from "./lib/Crawler";
import ArrayStore from "./lib/ArrayStore";
import Parser from "./lib/Parser";
import logger from "./lib/log";
import { DEFAULT_URL } from "../assets/config.json";

const url = process.argv[2] ? process.argv[2] : DEFAULT_URL;

const crawler = new Crawler(new Parser(), new ArrayStore(url));

try {
  crawler.crawl();
} catch (e) {
  logger.error(e);
}
