import logger from "./log";

/**
 * Modulo che fornisce funzioni per gestire la coda di URL nel crawler
 */
export default {
  /**
   * Aggiunge un URL alla coda se non è già stato visitato
   * @param {Object} client - Il client Redis
   * @param {string} url - L'URL da aggiungere alla coda
   * @returns {Promise<void>}
   */
  async addUrlToQueue(client, url) {
    const isVisited = await client.sIsMember("visitedUrls", url);
    if (!isVisited) {
      const score = Date.now(); // Usiamo il timestamp corrente come punteggio
      await client.zAdd("urlQueue", { score, value: url });
      logger.info(`URL aggiunto: ${url} con punteggio ${score}`);
    } else {
      logger.info(`URL già visitato: ${url}`);
    }
  },

  /**
   * Ottiene e rimuove il prossimo URL da visitare dalla coda
   * @param {Object} client - Il client Redis
   * @returns {Promise<Object|null>} - L'URL da visitare o null se la coda è vuota
   */
  async getNextUrlToVisit(client) {
    const url = await client.zPopMin("urlQueue");
    if (url) {
      logger.info(`Prossimo URL da visitare: ${url.value}`);
      return url;
    } else {
      logger.info("Nessun URL rimasto da visitare.");
      return null;
    }
  },

  /**
   * Segna un URL come visitato
   * @param {Object} client - Il client Redis
   * @param {string} url - L'URL da segnare come visitato
   * @returns {Promise<void>}
   */
  async markUrlAsVisited(client, url) {
    await client.sAdd("visitedUrls", url);
    logger.info(`URL marcato come visitato: ${url}`);
  },
};
