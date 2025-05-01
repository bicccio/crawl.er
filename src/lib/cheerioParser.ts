import * as cheerio from "cheerio";

interface Element {
  title: string;
  links: string[];
}

interface Parser {
  parse: (html: string) => void;
  getElements: () => Element;
  getLinks: () => string[];
  getTitle: () => string;
}

const cheerioParser = (): Parser => {
  // Inizializzazione di $ con un documento vuoto di default
  let $: cheerio.CheerioAPI = cheerio.load("");
  let isParsed = false;

  const parse = (html: string): void => {
    if (!html) {
      throw new Error("HTML is required for parsing");
    }
    $ = cheerio.load(html);
    isParsed = true;
  };

  const isReady = (): boolean => {
    if (!isParsed) {
      console.warn("Parser not initialized. Call parse() method first.");
      return false;
    }
    return true;
  };

  const getElements = (): Element => {
    if (!isReady()) {
      return { title: "", links: [] };
    }

    return {
      title: getTitle(),
      links: getLinks(),
    };
  };

  const getTitle = (): string => {
    if (!isReady()) return "";
    return $("title").text();
  };

  const getLinks = (): string[] => {
    if (!isReady()) return [];

    const anchors = $("a");
    const hrefs: string[] = [];

    $(anchors).each((index) => {
      const href = $(anchors[index]).attr("href");
      hrefs.push(href!);
    });

    return hrefs;
  };

  return { parse, getElements, getLinks, getTitle };
};

export default cheerioParser;
