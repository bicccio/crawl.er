import cheerio from "cheerio";
let $ = {};

export default () => {
  const parse = html => {
    $ = cheerio.load(html);
  };

  const getElements = () => {
    return {
      title: getTitle(),
      links: getLinks()
    };
  };

  const getTitle = () => {
    return $("title").text();
  };

  const getLinks = () => {
    const anchors = $("a");
    const hrefs = [];

    $(anchors).each(() => {
      const href = $(this).attr("href");
      hrefs.push(href);
    });

    return hrefs;
  };

  return { parse, getElements, getLinks, getTitle };
};
