import assert from "chai";

import Crawler from "../src/lib/Crawler.js";

const simpleAnchor = '<a href="http://www.google.com">Google</a>';

const divInsideAnchor = `
  <a href="http://www.google.com">
    <div>Ciaone</div>
  </a>`;

const nestedDivsAnchor = `
  <a href="http://www.google.com">
    <div>
      <div>Ciaone</div>
    </div>
  </a>`;

const nestedMultipleDivAnchor = `
  <a href="http://www.google.com">
    <div>
      <div>Ciaone</div>
      <div>Miao</div>
    </div>
  </a>`;

const imageAnchor = `
  <a href="http://www.google.com">
    <img src="www.gogle.com/image.png"></img>
  </a>`;

const nestedImageAnchor = `
  <a href="http://www.google.com">
    <div>
      <span>
        <img src="www.gogle.com/image.png"></img>
      </span>
    </div>
  </a>`;

const nestedAnchor = `
  <div>
    <span>
      <a href="http://www.google.com">Google</a>
    </span>
  </div>`;

const h1InAnchor = `
  <a href="http://www.google.com">
    <h1>miao</h1>
  </a>`;

describe("Crawler", function() {
  const crawler = new Crawler();

  describe("parse simple anchor", function() {
    const result = crawler.crawl(simpleAnchor);

    it("return href", function() {
      assert.equal(result.anchors[0].href, "http://www.google.com");
    });

    it("return content text", function() {
      assert.equal(result.anchors[0].text, "Google");
    });
  });

  describe("parse div inside anchor ", function() {
    const result = crawler.parse(divInsideAnchor);

    it("return href", function() {
      assert.equal(result.anchors[0].href, "http://www.google.com");
    });

    it("return content text", function() {
      assert.equal(result.anchors[0].text, "Ciaone");
    });
  });

  describe("parse nested div", function() {
    const result = crawler.parse(nestedDivsAnchor);

    it("return href", function() {
      assert.equal(result.anchors[0].href, "http://www.google.com");
    });

    it("return content text", function() {
      assert.equal(result.anchors[0].text, "Ciaone");
    });
  });

  describe("parse nested multiple div", function() {
    const result = crawler.parse(nestedMultipleDivAnchor);

    it("return href", function() {
      assert.equal(result.anchors[0].href, "http://www.google.com");
    });

    it("return content text", function() {
      assert.equal(result.anchors[0].text[0], "Ciaone");
      assert.equal(result.anchors[0].text[1], "Miao");
    });
  });

  describe("parse images anchor", function() {
    const result = crawler.parse(imageAnchor);

    it("return href", function() {
      assert.equal(result.anchors[0].href, "http://www.google.com");
    });

    it("return content images", function() {
      assert.equal(result.anchors[0].images, "www.gogle.com/image.png");
    });
  });

  describe("parse images anchor", function() {
    const result = crawler.parse(nestedImageAnchor);

    it("return href", function() {
      assert.equal(result.anchors[0].href, "http://www.google.com");
    });

    it("return content images", function() {
      assert.equal(result.anchors[0].images, "www.gogle.com/image.png");
    });
  });

  describe("nested anchor", function() {
    const result = crawler.parse(nestedAnchor);

    it("return href", function() {
      assert.equal(result.anchors[0].href, "http://www.google.com");
    });

    it("return content text", function() {
      assert.equal(result.anchors[0].text, "Google");
    });
  });

  describe("h1 inside ", function() {
    const result = crawler.parse(h1InAnchor);
    it("return href", function() {
      assert.equal(result.anchors[0].href, "http://www.google.com");
    });

    it("return content h1 name", function() {
      assert.equal(result.anchors[0].heading[0].name, "h1");
    });

    it("return content h1 text", function() {
      assert.equal(result.anchors[0].heading[0].text[0], "miao");
    });
  });
});
