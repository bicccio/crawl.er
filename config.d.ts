export interface Config {
  START_URLS: string[];
  BLACKLIST: string[];
  MAX_PAGES_TO_VISIT: number;
  HEADERS: {
    "User-Agent": string;
    [key: string]: string;
  };
  REQUEST_TIMEOUT: number;
  SLEEP: number;
}
