import logger from "./log";

/**
 * Factory che crea un gestore della coda di URL per il crawler
 * @param {Object} client - Il client Redis da utilizzare
 * @returns {Object} - Un oggetto con metodi per gestire la coda
 */
export default (client) => {
  /**
   * Aggiunge un URL alla coda se non è già stato visitato
   * @param {string} url - L'URL da aggiungere alla coda
   * @returns {Promise<void>}
   */
  const addUrlToQueue = async (url) => {
    const isVisited = await client.sIsMember("visitedUrls", url);
    if (!isVisited) {
      const score = Date.now(); // Usiamo il timestamp corrente come punteggio
      await client.zAdd("urlQueue", { score, value: url });
      logger.info(`URL aggiunto: ${url} con punteggio ${score}`);
    } else {
      logger.info(`URL già visitato: ${url}`);
    }
  };

  /**
   * Ottiene e rimuove il prossimo URL da visitare dalla coda
   * @returns {Promise<Object|null>} - L'URL da visitare o null se la coda è vuota
   */
  const getNextUrlToVisit = async () => {
    const url = await client.zPopMin("urlQueue");
    if (url) {
      logger.info(`Prossimo URL da visitare: ${url.value}`);
      return url;
    } else {
      logger.info("Nessun URL rimasto da visitare.");
      return null;
    }
  };

  /**
   * Segna un URL come visitato
   * @param {string} url - L'URL da segnare come visitato
   * @returns {Promise<void>}
   */
  const markUrlAsVisited = async (url) => {
    await client.sAdd("visitedUrls", url);
    logger.info(`URL marcato come visitato: ${url}`);
  };

  return {
    addUrlToQueue,
    getNextUrlToVisit,
    markUrlAsVisited,
  };
};
