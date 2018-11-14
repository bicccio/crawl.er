import init from "./src/crawler";

(async function start() {
  const crawler = await init();
  crawler.crawl();
})();
