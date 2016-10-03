var Crawler = require("../crawler.js");
var assert = require('chai').assert
var fs = require('fs');

var simpleAnchor = '<a href="http://www.google.com">Google</a>'

var divInsideAnchor = ` \
  <a href="http://www.google.com"> \
    <div>Ciaone</div>
  </a>`

var nestedDivAnchor = ` \
  <a href="http://www.google.com"> \
    <div>
      <div>Ciaone</div>
    </div>
  </a>`

var imageAnchor = ` \
  <a href="http://www.google.com"> \
    <img src="www.gogle.com/image.png"></img>
  </a>`

var nestedImageAnchor = ` \
  <a href="http://www.google.com"> \
    <div>
      <span>
        <img src="www.gogle.com/image.png"></img>
      </span>
    </div>
  </a>`


describe('Crawler', function() {
  var crawler = new Crawler();

  describe('parse simple anchor', function() {
    var result = crawler.parse(simpleAnchor);

    it('return href', function() {
      assert.equal(result.anchors[0].href, "http://www.google.com");
    });

    it('return content text', function(){
      assert.equal(result.anchors[0].text, "Google");
    });
  });

  describe('parse div inside anchor ', function() {
    var result = crawler.parse(divInsideAnchor);

    it('return href', function() {
      assert.equal(result.anchors[0].href, "http://www.google.com");
    });

    it('return content text', function(){
      assert.equal(result.anchors[0].text, "Ciaone");
    });
  });

  describe('parse nested div', function() {
    var result = crawler.parse(nestedDivAnchor);

    it('return href', function() {
      assert.equal(result.anchors[0].href, "http://www.google.com");
    });

    it('return content text', function(){
      assert.equal(result.anchors[0].text, "Ciaone");
    });
  });

  describe('parse images anchor', function() {
    var result = crawler.parse(imageAnchor);

    it('return href', function() {
      assert.equal(result.anchors[0].href, "http://www.google.com");
    });

    it('return content images', function(){
      assert.equal(result.anchors[0].images, "www.gogle.com/image.png");
    });
  });

  describe('parse images anchor', function() {
    var result = crawler.parse(nestedImageAnchor);

    it('return href', function() {
      assert.equal(result.anchors[0].href, "http://www.google.com");
    });

    it('return content images', function(){
      assert.equal(result.anchors[0].images, "www.gogle.com/image.png");
    });
  });



});
