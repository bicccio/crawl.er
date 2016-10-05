var Crawler = require("../crawler.js");
var assert = require('chai').assert

var simpleParagraph = "<p>Miao</p>"
var simpleDiv = "<div>Ciao</div>"

describe('Crawler with paragraphs', function() {
  var crawler = new Crawler();

  describe('parse simple paragraphs', function() {
    var result = crawler.parse(simpleParagraph);
    it('return content text', function(){
      assert.equal(result.text[0], "Miao");
    });
  });

  describe('parse simple div', function() {
    var result = crawler.parse(simpleDiv);
    it('return content text', function(){
      assert.equal(result.text[0], "Ciao");
    });
  });

});
