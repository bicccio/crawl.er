var Crawler = require("../crawler.js");
var assert = require('chai').assert
var fs = require('fs');

describe('Crawler', function() {
  it('parse single anchor return source', function() {
    fs.readFile(__dirname + '/test1.html', 'utf8', function(err, html){
      if(err){
        console.log(err);
      }else{
        var crawler = new Crawler()
        result = crawler.parse(html);
        assert.equal(result.anchors[0].href, "http://www.google.com");
      }
    });
  });
});
