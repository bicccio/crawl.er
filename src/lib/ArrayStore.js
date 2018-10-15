import { log } from "util";

export default class ArrayStore {
  constructor(startUrl) {
    this.pagesToVisit = startUrl ? [startUrl] : [];
  }

  push(page) {
    //console.log(this.pagesToVisit);
    this.pagesToVisit.push(page);
  }

  shift() {
    return this.pagesToVisit.shift();
  }

  length() {
    console.log(this.pagesToVisit.length);
    return this.pagesToVisit.length;
  }

  include(page) {
    return this.pagesToVisit.indexOf(page) > -1 ? true : false;
  }
}
