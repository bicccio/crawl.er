import Parser from "./lib/Parser";
import parserUrl from "url";
import Crawler from "./lib/Crawler";
import { START_URLS, BLACKLIST } from "../conf/config.json";
import Datastore from "nedb-promises";

export default async function init() {
  const urls = process.argv[2] ? [...process.argv[2]] : START_URLS;

  const db = Datastore.create({ filename: "./db" });
  db.persistence.setAutocompactionInterval(10000);
  await db.load();

  await Promise.all(
    urls.map(async url => {
      const res = await db.find({
        url: url
      });

      if (res && res.length === 0) {
        ({ protocol, hostname } = parserUrl.parse(cleanUrl));
        if (BLACKLIST.indexOf(hostname) > -1) return;
        await db.insert({
          url: url,
          title: "",
          visited: false
        });
      }
    })
  );

  return Crawler(new Parser(), db);
}
