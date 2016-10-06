var Crawler = require("../crawler.js");
var assert = require('chai').assert

var simpleUnorderedList = `<ul>
    <li>
      Miao
    </li>
    <li>
      Ciao
    </li>
  </ul>`
var listWithHeading = "<ul><li><h1>Miao</h1></li></ul>"
var listWithMultipleHeading = `<ul>
    <li>
      <h1>Miao</h1>
    </li>
    <li>
      <h1>Ciao</h1>
    </li>
  </ul>`
var listWithMultipleAnchors = `
  <ul>
    <li>
      <a href="www.google.com">Google</a>
    </li>
    <li>
      <a href="www.facebook.com">Facebook</a>
    </li>
  </ul>`

describe('Crawler with list', function() {
  var crawler = new Crawler();

  describe('parse simple unordered list', function() {
    var result = crawler.parse(simpleUnorderedList);
    it('return content text', function(){
      assert.equal(result.text[0], "Miao");
      assert.equal(result.text[1], "Ciao");
    });
  });

  describe('parse unordered list wifth heading', function() {
    var result = crawler.parse(listWithHeading);
    it('return content text', function(){
      assert.equal(result.heading[0].text, "Miao");
      assert.equal(result.heading[0].name, "h1");
    });
  });

  describe('parse unordered list wifth heading', function() {
    var result = crawler.parse(listWithMultipleHeading);
    it('return content text', function(){
      assert.equal(result.heading[0].text, "Miao");
      assert.equal(result.heading[0].name, "h1");
      assert.equal(result.heading[1].text, "Ciao");
      assert.equal(result.heading[1].name, "h1");
    });
  });

  describe('parse unordered list wifth anchors', function() {
    var result = crawler.parse(listWithMultipleAnchors);
    it('return content text', function(){
      assert.equal(result.anchors[0].href, "www.google.com");
      assert.equal(result.anchors[0].text, "Google");
      assert.equal(result.anchors[1].href, "www.facebook.com");
      assert.equal(result.anchors[1].text, "Facebook");
    });
  });

});
