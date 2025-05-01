import * as cheerio from "cheerio";

const cheerioParser = () => {
  // Inizializzazione di $ con un documento vuoto di default
  let $ = cheerio.load("");
  let isParsed = false;

  const parse = (html) => {
    if (!html) {
      throw new Error("HTML is required for parsing");
    }
    $ = cheerio.load(html);
    isParsed = true;
  };

  const isReady = () => {
    if (!isParsed) {
      console.warn("Parser not initialized. Call parse() method first.");
      return false;
    }
    return true;
  };

  const getElements = () => {
    if (!isReady()) {
      return { title: "", links: [] };
    }

    return {
      title: getTitle(),
      links: getLinks(),
    };
  };

  const getTitle = () => {
    if (!isReady()) return "";
    return $("title").text();
  };

  const getLinks = () => {
    if (!isReady()) return [];

    const anchors = $("a");
    const hrefs = [];

    $(anchors).each((index) => {
      const href = $(anchors[index]).attr("href");
      hrefs.push(href);
    });

    return hrefs;
  };

  return { parse, getElements, getLinks, getTitle };
};

export default cheerioParser;
