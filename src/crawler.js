import Crawler from "./lib/Crawler";
let url = "https://www.musixmatch.com";

if (process.argv[2]) {
  url = process.argv[2];
}

const START_URL = "https//" + url;

var crawler = new Crawler(url);
crawler.crawl();
