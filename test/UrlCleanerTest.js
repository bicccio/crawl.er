const UrlCleaner = require("../src/lib/UrlCleaner.js").default;
const expect = require("chai").expect;

describe("UrlCleaner", () => {
  let urlCleaner;
  const protocol = "http:";
  const hostname = "www.google.com";

  beforeEach(() => {
    urlCleaner = UrlCleaner();
  });

  it("leave unalterated complete urls", () => {
    const url = "http://www.google.com";

    const cleanUrl = urlCleaner.clean(url);

    expect(cleanUrl).to.be.equal("http://www.google.com");
  });

  it("remove leading slash", () => {
    const url = "http://www.google.com/miao";

    const cleanUrl = urlCleaner.clean(url);

    expect(cleanUrl).to.be.equal("http://www.google.com/miao");
  });

  it("remove leading slash", () => {
    const url = "http://www.google.com/";

    const cleanUrl = urlCleaner.clean(url);

    expect(cleanUrl).to.be.equal("http://www.google.com");
  });

  it("add protocol if not present", () => {
    const url = "//www.google.com";

    const cleanUrl = urlCleaner.clean(url, null, protocol);

    expect(cleanUrl).to.be.equal("http://www.google.com");
  });

  it("add protocol if not present", () => {
    const url = "//www.google.com/";

    const cleanUrl = urlCleaner.clean(url, null, protocol);

    expect(cleanUrl).to.be.equal("http://www.google.com");
  });

  it("add protocol and hostname if not presents", () => {
    const url = "/miao";

    const cleanUrl = urlCleaner.clean(url, hostname, protocol);

    expect(cleanUrl).to.be.equal("http://www.google.com/miao");
  });

  it("add protocol and hostname if not presents", () => {
    const url = "/miao/";

    const cleanUrl = urlCleaner.clean(url, hostname, protocol);

    expect(cleanUrl).to.be.equal("http://www.google.com/miao");
  });

  it("add protocol and hostname if not presents", () => {
    const url = "miao";

    const cleanUrl = urlCleaner.clean(url, hostname, protocol);

    expect(cleanUrl).to.be.equal("http://www.google.com/miao");
  });

  it("add protocol and hostname if not presents", () => {
    const url = "miao/";

    const cleanUrl = urlCleaner.clean(url, hostname, protocol);

    expect(cleanUrl).to.be.equal("http://www.google.com/miao");
  });

  it("add protocol and hostname if not presents", () => {
    const url = "/";

    const cleanUrl = urlCleaner.clean(url, hostname, protocol);

    expect(cleanUrl).to.be.equal("http://www.google.com");
  });
});
