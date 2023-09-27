import Parser from "./lib/Parser";
import Crawler from "./lib/Crawler";
import Store from "./lib/NeDBStore";

import { START_URLS, BLACKLIST } from "../conf/config.json";
import { logger } from "winston";

const CONCURRENT = 1;

export default async function init() {
  const urls = process.argv[2] ? [...process.argv[2]] : START_URLS;

  const store = Store();
  await store.init();

  // insert initial urls in database
  try {
    await Promise.all(
      urls.map(async (url) => {
        const res = await store.findByUrl(url);

        if (!res) {
          const cleanUrl = url.replace(/\/$/, "");
          const urlObject = new URL(url);
          const hostname = urlObject.hostname;
          if (BLACKLIST.includes(hostname)) return;
          await store.insert(cleanUrl, "", false);
        }
      })
    );
  } catch (err) {
    logger.error(err);
  }

  return Crawler(Parser(), store);
}
