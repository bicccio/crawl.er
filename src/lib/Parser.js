"use strict";

import cheerio from "cheerio";

export default class Parser {
  parse(html) {
    const $ = cheerio.load(html);
    const anchors = $("a");
    const hrefs = [];

    $(anchors).each(function(i, link) {
      const href = $(this).attr("href");
      hrefs.push(href);
    });

    return hrefs;
  }

  // walk($) {
  //   const anchors = $("a");
  //   return anchors;
  // }
}
