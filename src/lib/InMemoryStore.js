export default class InMemoryStore {
  constructor(startUrls) {
    this.pagesToVisit = startUrls || [];
  }

  push(page) {
    this.pagesToVisit.push(page);
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
