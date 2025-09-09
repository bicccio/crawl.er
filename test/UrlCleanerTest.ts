import urlCleaner from "../src/lib/urlCleaner";
import { expect } from "chai";

describe("UrlCleaner", () => {
  let urlCleanerInstance: ReturnType<typeof urlCleaner>;
  const protocol = "http:";
  const hostname = "www.google.com";

  beforeEach(() => {
    urlCleanerInstance = urlCleaner();
  });

  it("leave unalterated complete urls", () => {
    const url = "http://www.google.com";

    const cleanUrl = urlCleanerInstance.clean(url);

    expect(cleanUrl).to.be.equal("http://www.google.com");
  });

  it("remove leading slash", () => {
    const url = "http://www.google.com/miao";

    const cleanUrl = urlCleanerInstance.clean(url);

    expect(cleanUrl).to.be.equal("http://www.google.com/miao");
  });

  it("remove leading slash", () => {
    const url = "http://www.google.com/";

    const cleanUrl = urlCleanerInstance.clean(url);

    expect(cleanUrl).to.be.equal("http://www.google.com");
  });

  it("add protocol if not present", () => {
    const url = "//www.google.com";

    const cleanUrl = urlCleanerInstance.clean(url, undefined, protocol);

    expect(cleanUrl).to.be.equal("http://www.google.com");
  });

  it("add protocol if not present", () => {
    const url = "//www.google.com/";

    const cleanUrl = urlCleanerInstance.clean(url, undefined, protocol);

    expect(cleanUrl).to.be.equal("http://www.google.com");
  });

  it("add protocol and hostname if not presents", () => {
    const url = "/miao";

    const cleanUrl = urlCleanerInstance.clean(url, hostname, protocol);

    expect(cleanUrl).to.be.equal("http://www.google.com/miao");
  });

  it("add protocol and hostname if not presents", () => {
    const url = "/miao/";

    const cleanUrl = urlCleanerInstance.clean(url, hostname, protocol);

    expect(cleanUrl).to.be.equal("http://www.google.com/miao");
  });

  it("add protocol and hostname if not presents", () => {
    const url = "miao";

    const cleanUrl = urlCleanerInstance.clean(url, hostname, protocol);

    expect(cleanUrl).to.be.equal("http://www.google.com/miao");
  });

  it("add protocol and hostname if not presents", () => {
    const url = "miao/";

    const cleanUrl = urlCleanerInstance.clean(url, hostname, protocol);

    expect(cleanUrl).to.be.equal("http://www.google.com/miao");
  });

  it("add protocol and hostname if not presents", () => {
    const url = "/";

    const cleanUrl = urlCleanerInstance.clean(url, hostname, protocol);

    expect(cleanUrl).to.be.equal("http://www.google.com");
  });
});
