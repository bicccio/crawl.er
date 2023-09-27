import init from "./src/crawler";

(async () => {
  const crawler = await init();
  crawler.crawl();
})();
