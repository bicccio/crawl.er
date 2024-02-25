import Parser from "./lib/Parser";
import Crawler from "./lib/Crawler";
import { createClient } from "redis";
import { START_URLS, BLACKLIST } from "../conf/config.json";
import { logger } from "winston";

export default async function init() {
  async function addUrlToQueue(url) {
    const isVisited = await client.sIsMember("visitedUrls", url);

    if (!isVisited) {
      const score = Date.now(); // Usiamo il timestamp corrente come punteggio
      await client.zAdd("urlQueue", { score, value: url });
      console.log(`URL aggiunto: ${url} con punteggio ${score}`);
    } else {
      console.log(`URL già visitato: ${url}`);
    }
  }

  const urls = process.argv[2] ? [...process.argv[2]] : START_URLS;

  const client = createClient();
  client.on("error", (err) => console.log("Redis Client Error", err));

  await client.connect();

  // insert initial urls in database
  try {
    await Promise.all(
      urls.map(async (url) => {
        const cleanUrl = url.replace(/\/$/, "");
        const urlObject = new URL(url);
        const hostname = urlObject.hostname;
        if (BLACKLIST.includes(hostname)) return;

        await addUrlToQueue(cleanUrl);
      })
    );
  } catch (err) {
    logger.error(err);
  }

  return Crawler(Parser(), client);
}
