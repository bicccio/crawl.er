import logger from "./utils/logger";
import { setupCrawler } from "./services/crawlerService";

// Funzione principale che avvia il crawler
(async () => {
  try {
    const crawler = await setupCrawler();
    crawler.crawl();
  } catch (error) {
    logger.error("Errore durante l'avvio del crawler:", error);
    process.exit(1);
  }
})();
