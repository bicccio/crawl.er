import Parser from "./lib/Parser";
import parserUrl from "url";
import Crawler from "./lib/Crawler";
import { START_URLS, BLACKLIST } from "../conf/config.json";
import Datastore from "nedb-promises";
import Store from "./lib/Store";

const CONCURRENT = 1;

export default async function init() {
  const urls = process.argv[2] ? [...process.argv[2]] : START_URLS;

  const store = Store();
  await store.init();

  // init and load db
  // const db = Datastore.create({ filename: "./db" });
  // db.persistence.setAutocompactionInterval(10000);
  // await db.load();

  // insert initial urls in database
  await Promise.all(
    urls.map(async url => {
      const res = await store.findByUrl(url);

      if (!res) {
        ({ protocol, hostname } = parserUrl.parse(cleanUrl));
        if (BLACKLIST.includes(hostname)) return;
        await store.insert(url, "", false);
      }
    })
  );

  const crawlers = [];

  for (let i = 0; i < CONCURRENT; i++) crawlers.push(Crawler(Parser(), store));

  return crawlers;
}
