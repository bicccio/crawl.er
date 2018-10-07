import Crawler from "./lib/Crawler";

let url = "https://news.ycombinator.com/";

if (process.argv[2]) {
  url = process.argv[2];
}

const crawler = new Crawler(url);

crawler.crawl();
