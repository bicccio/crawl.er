var assert = require("chai").assert;
//var fs = require("fs");
var Crawler = require("../src/lib/Crawler.js");

var simpleAnchor = '<a href="http://www.google.com">Google</a>';

var divInsideAnchor = `
  <a href="http://www.google.com">
    <div>Ciaone</div>
  </a>`;

var nestedDivsAnchor = `
  <a href="http://www.google.com">
    <div>
      <div>Ciaone</div>
    </div>
  </a>`;

var nestedMultipleDivAnchor = `
  <a href="http://www.google.com">
    <div>
      <div>Ciaone</div>
      <div>Miao</div>
    </div>
  </a>`;

var imageAnchor = `
  <a href="http://www.google.com">
    <img src="www.gogle.com/image.png"></img>
  </a>`;

var nestedImageAnchor = `
  <a href="http://www.google.com">
    <div>
      <span>
        <img src="www.gogle.com/image.png"></img>
      </span>
    </div>
  </a>`;

var nestedAnchor = `
  <div>
    <span>
      <a href="http://www.google.com">Google</a>
    </span>
  </div>`;

var h1InAnchor = `
  <a href="http://www.google.com">
    <h1>miao</h1>
  </a>`;

describe("Crawler", function() {
  var crawler = new Crawler();

  describe("parse simple anchor", function() {
    var result = crawler.parse(simpleAnchor);

    it("return href", function() {
      assert.equal(result.anchors[0].href, "http://www.google.com");
    });

    it("return content text", function() {
      assert.equal(result.anchors[0].text, "Google");
    });
  });

  describe("parse div inside anchor ", function() {
    var result = crawler.parse(divInsideAnchor);

    it("return href", function() {
      assert.equal(result.anchors[0].href, "http://www.google.com");
    });

    it("return content text", function() {
      assert.equal(result.anchors[0].text, "Ciaone");
    });
  });

  describe("parse nested div", function() {
    var result = crawler.parse(nestedDivsAnchor);

    it("return href", function() {
      assert.equal(result.anchors[0].href, "http://www.google.com");
    });

    it("return content text", function() {
      assert.equal(result.anchors[0].text, "Ciaone");
    });
  });

  describe("parse nested multiple div", function() {
    var result = crawler.parse(nestedMultipleDivAnchor);

    it("return href", function() {
      assert.equal(result.anchors[0].href, "http://www.google.com");
    });

    it("return content text", function() {
      assert.equal(result.anchors[0].text[0], "Ciaone");
      assert.equal(result.anchors[0].text[1], "Miao");
    });
  });

  describe("parse images anchor", function() {
    var result = crawler.parse(imageAnchor);

    it("return href", function() {
      assert.equal(result.anchors[0].href, "http://www.google.com");
    });

    it("return content images", function() {
      assert.equal(result.anchors[0].images, "www.gogle.com/image.png");
    });
  });

  describe("parse images anchor", function() {
    var result = crawler.parse(nestedImageAnchor);

    it("return href", function() {
      assert.equal(result.anchors[0].href, "http://www.google.com");
    });

    it("return content images", function() {
      assert.equal(result.anchors[0].images, "www.gogle.com/image.png");
    });
  });

  describe("nested anchor", function() {
    var result = crawler.parse(nestedAnchor);

    it("return href", function() {
      assert.equal(result.anchors[0].href, "http://www.google.com");
    });

    it("return content text", function() {
      assert.equal(result.anchors[0].text, "Google");
    });
  });

  describe("h1 inside ", function() {
    var result = crawler.parse(h1InAnchor);
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
