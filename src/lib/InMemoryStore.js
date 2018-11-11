export default class InMemoryStore {
  constructor(startUrls) {
    this.pagesToVisit = startUrls || [];
  }

  push(url) {
    if (!url) return;
    this.pagesToVisit.push(url);
  }

  shift() {
    return this.pagesToVisit.shift();
  }

  length() {
    return this.pagesToVisit.length;
  }

  include(page) {
    return this.pagesToVisit.indexOf(page) > -1 ? true : false;
  }
}
