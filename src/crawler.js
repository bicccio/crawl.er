import Crawler from './lib/Crawler';
console.log(Crawler);
const START_URL = 'https://' + process.argv[2];

var crawler = new Crawler(START_URL);
crawler.crawl();
