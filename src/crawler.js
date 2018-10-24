import InMemoryStore from "./lib/InMemoryStore";
import Parser from "./lib/Parser";
import Crawler from "./lib/Crawler";
import { STORE, START_URLS } from "../conf/config.json";

function init() {
  const urls = process.argv[2] ? Array.prototype.concat([], process.argv[2]) : START_URLS;

  let store = {};
  if (STORE === "memory") store = new InMemoryStore(urls);

  return new Crawler(new Parser(), store);
}

export default init();
