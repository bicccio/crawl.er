var Crawler = require("../crawler.js");
var assert = require('chai').assert

var simpleH1 = "<h1>Miao</h1>"
var anchorNestedInH1 = '<h1><a href="www.google.com">Miao</a></h1>'
// var simpleDiv = "<div>Ciao</div>"

describe('Crawler with headings', function() {
  var crawler = new Crawler();

  describe('parse simple h1', function() {
    var result = crawler.parse(simpleH1);
    it('return content text', function(){
      assert.equal(result.heading[0].text, "Miao");
      assert.equal(result.heading[0].name, 'h1')
    });
  });

  describe('parse anchor nested in h1', function() {
    var result = crawler.parse(anchorNestedInH1);
    it('return content text', function(){
      assert.equal(result.heading[0].anchors[0].text, "Miao");
      assert.equal(result.heading[0].anchors[0].href, "www.google.com");
      assert.equal(result.heading[0].name, 'h1')
    });
  });

  // describe('parse simple div', function() {
  //   var result = crawler.parse(simpleDiv);
  //   it('return content text', function(){
  //     assert.equal(result.text[0], "Ciao");
  //   });
  // });

});
