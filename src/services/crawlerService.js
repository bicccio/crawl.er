import Parser from "../lib/Parser";
import Crawler from "../lib/Crawler";
import { createClient } from "redis";
import { START_URLS, BLACKLIST } from "../../config.json";
import { logger } from "winston";

/**
 * Aggiunge un URL alla coda se non è stato già visitato
 */
async function addUrlToQueue(client, url) {
  const isVisited = await client.sIsMember("visitedUrls", url);

  if (!isVisited) {
    const score = Date.now();
    await client.zAdd("urlQueue", { score, value: url });
    console.log(`URL aggiunto: ${url} con punteggio ${score}`);
  } else {
    console.log(`URL già visitato: ${url}`);
  }
}

/**
 * Configura il client Redis e inizializza la coda degli URL
 */
async function setupRedisClient(initialUrls) {
  const client = createClient();
  client.on("error", (err) => console.log("Redis Client Error", err));

  await client.connect();

  // Inserisce gli URL iniziali nel database
  try {
    await Promise.all(
      initialUrls.map(async (url) => {
        const cleanUrl = url.replace(/\/$/, "");
        const urlObject = new URL(url);
        const hostname = urlObject.hostname;
        if (BLACKLIST.includes(hostname)) return;

        await addUrlToQueue(client, cleanUrl);
      })
    );
  } catch (err) {
    logger.error(err);
  }

  return client;
}

/**
 * Configura il crawler con Redis e ritorna un'istanza pronta all'uso
 */
export async function setupCrawler() {
  const urls = process.argv[2] ? [process.argv[2]] : START_URLS;
  const client = await setupRedisClient(urls);
  return Crawler(Parser(), client);
}
