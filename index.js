const logger = require("./src/lib/log").default;

console.log(logger.error);

// Configurazione Babel per la transpilazione
require("@babel/register")({
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          esmodules: true,
        },
      },
    ],
  ],
});

// Importa direttamente il servizio crawler
const { setupCrawler } = require("./src/services/crawlerService");

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
