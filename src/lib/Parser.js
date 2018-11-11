import cheerio from "cheerio";
let $ = {};

export default class Parser {
  parse(html) {
    $ = cheerio.load(html);
  }

  getTitle() {
    return $("title").text();
  }

  getLinks() {
    const anchors = $("a");
    const hrefs = [];

    $(anchors).each(function(i, link) {
      const href = $(this).attr("href");
      hrefs.push(href);
    });

    return hrefs;
  }
}
