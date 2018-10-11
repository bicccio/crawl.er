export default class ArrayStore {
  constructor(startUrl) {
    this.pagesToVisit = startUrl ? [startUrl] : [];
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
}
