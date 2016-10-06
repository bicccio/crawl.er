var Crawler = require("../crawler.js");
var assert = require('chai').assert

var simpleTable = "<table>Miao</table>"
var completeTable = "<table><tr><td>Miao</td></tr></table>"
var tableWithHeading = "<table><tr><td><h1>Miao</h1></td></tr></table>"
var tableWithAnchor = "<table><tr><td><a href=\"www.google.com\">Miao</a></td></tr></table>"


describe('Crawler with tables', function() {
  var crawler = new Crawler();

  describe('parse simple table', function() {
    var result = crawler.parse(simpleTable);
    it('return content text', function(){
      assert.equal(result.text[0], "Miao");
    });
  });

  describe('parse complete table', function() {
    var result = crawler.parse(completeTable);
    it('return content text', function(){
      assert.equal(result.text[0], "Miao");
    });
  });

  describe('parse table with heading', function() {
    var result = crawler.parse(tableWithHeading);

    it('return h1 name', function(){
      assert.equal(result.heading[0].name, "h1");
    });

    it('return content text', function(){
      assert.equal(result.heading[0].text[0], "Miao");
    });
  });

  describe('parse table with anchor', function() {
    var result = crawler.parse(tableWithAnchor);

    it('return href', function(){
      assert.equal(result.anchors[0].href, "www.google.com");
    });

    it('return content text', function(){
      assert.equal(result.anchors[0].text[0], "Miao");
    });
  });

});
