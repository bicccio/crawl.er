import init from "./src/crawler";

(async () => {
  const crawlers = await init();
  crawlers.forEach(crawler => crawler.crawl());
})();
