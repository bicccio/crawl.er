export interface Element {
  title: string;
  links: string[];
}

export interface Parser {
  parse: (html: string) => void;
  getElements: () => Element;
  getLinks: () => string[];
  getTitle: () => string;
}
