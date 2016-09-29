"use strict";

var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');
var fs = require('fs');
var htmlToText = require('html-to-text');
var htmlparser = require('htmlparser2');
var _ = require('underscore');
var he = require('he');


class Crawler {
  constructor(startUrl) {
    this.startUrl = "https://" + startUrl;
;
    // this.url = new URL(this.startUrl);
    // this.maxPageToVisit = 50;
    // this.baseUrl = this.url.protocol + "//" + this.url.hostname;
    this.file = fs.createWriteStream('urls.txt');
    this.pagesToVisit = [];
    this.pagesToVisit.push(this.startUrl);
    this.pagesVisited = {};
    this.numPagesVisited = 0;


  }

  crawl() {
    if(numPagesVisited >= MAX_PAGES_TO_VISIT) {
      console.log("Reached max limit of number of pages to visit.");
      return;
    }

    var nextPage = this.pagesToVisit.pop();
    if (nextPage) {
      // savePageToVisit(pagesToVisit);
      if (nextPage in this.pagesVisited) {
        // crawl();
      } else {
        this.visitPage(nextPage, this.crawl);
      }
    } else {
      console.log("Finish!!!");
    }
  }

  visitPage(url, callback) {
    // Add page to our set
    this.pagesVisited[url] = true;
    this.numPagesVisited++;

    // Make the request
    console.log("Visiting page " + url);
    var options = {
      url: url,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36'
      }
    }

    request(options, function(error, response, body) {
      if (error) {
        console.log(error);
        return;
      }

      //Check status code (200 is HTTP OK)
      if (!response || response.statusCode !== 200) {
        console.log("Response status code: ", response.statusCode);
        // callback();
        return;
      }

      console.log(url + ": " + response.statusCode);

      // Parse the document body
      var $ = cheerio.load(body);

      var handler = new htmlparser.DomHandler(function (error, dom) {
      }, {
        verbose: true
      });

      var parser = new htmlparser.Parser(handler);
      parser.write($.html());
      parser.done();

      var result = '';
      result = this.walk(handler.dom);
      console.log(JSON.stringify(result));

      // callback();
    }.bind(this));
  }

  walk(dom, result) {
    if (arguments.length < 2) {
  		var result = {};
  	}

    _.each(dom, function(elem) {
  		switch(elem.type) {
        case 'tag':
          console.log("miao************");
          console.log(this);
          switch(elem.name.toLowerCase()) {
            case 'img':
              if (!result['img']) {
                result['img'] = []
              }
              var img = this.image(elem);
              if (typeof img != 'undefined') {
                result['img'].push(img);
              }
              break;
            case 'a':
  						// Inline element needs its leading space to be trimmed if `result`
  						// currently ends with whitespace
  						// elem.trimLeadingSpace = whiteSpaceRegex.test(result);
              if (!result['anchor']) {
                result['anchor'] = []
              }
              var a = this.anchor(elem, this.walk);
  						result['anchor'].push(a);
  						break;
    //         case 'p':
    //           if (!result['paragraphs']) {
    //             result['paragraphs'] = []
    //           }
    //           var p = paragraph(elem, walk);
  	// 					result['paragraphs'].push(p);
  	// 					break;
    //         case 'h1':
  	// 				case 'h2':
  	// 				case 'h3':
  	// 				case 'h4':
  	// 				case 'h5':
  	// 				case 'h6':
    //           if (!result['heading']) {
    //             result['heading'] = []
    //           }
    //           var h = heading(elem, walk);
  	// 					result['heading'].push(h);
  	// 					break;
    //         case 'br':
  	// 					// result += format.lineBreak(elem, walk, options);
  	// 					break;
  	// 				case 'hr':
  	// 					// result += format.horizontalLine(elem, walk, options);
  	// 					break;
  	// 				case 'ul':
  	// 					// result += format.unorderedList(elem, walk, options);
  	// 					break;
  	// 				case 'ol':
  	// 					// result += format.orderedList(elem, walk, options);
  	// 					break;
  	// 				case 'pre':
  	// 					// var newOptions = _(options).clone();
  	// 					// newOptions.isInPre = true;
  	// 					// result += format.paragraph(elem, walk, newOptions);
  	// 					break;
  	// 				case 'table':
  	// 					// if (containsTable(elem.attribs, options.tables)) {
  	// 					// 	result += format.table(elem, walk, options);
  	// 					// 	break;
  	// 					// }
            default:
  						result = this.walk(elem.children || [], result);
          };
          break;
        case 'text':
  	// 		  if (elem.data.trim() !== '') {
  	// 				// Text needs its leading space to be trimmed if `result`
  	// 				// currently ends with whitespace
    //         if (!result['text']) {
    //           result['text'] = []
    //         }
    //         var t = text(elem);
    // 				result['text'].push(t);
  	// 			}
  				break;
        default:
          result = this.walk(elem.children || [], result);
      }

    }.bind(this));

    return result;

  }

  image(elem) {
    return elem.attribs.src
  }

  anchor(elem, fn) {
    var text = fn(elem.children || []);
  	if (!text) {
  		text = '';
  	}
    if (elem.attribs && elem.attribs.href) {
  		var href = elem.attribs.href.replace(/^mailto\:/, '');
  	}
    return {
      href: href,
      text: text
    }
  }

}

var crawler = new Crawler('www.airbnb.com');
crawler.crawl();


var START_URL = "https://" + process.argv[2];
// var SEARCH_WORD = "apple";
var MAX_PAGES_TO_VISIT = 50;

var pagesVisited = {};
var numPagesVisited = 0;
var pagesToVisit = [];
var url = new URL(START_URL);
var baseUrl = url.protocol + "//" + url.hostname;
var file = fs.createWriteStream('urls.txt');

console.log("Start URL: ", START_URL);
pagesToVisit.push(START_URL);
// savePageToVisit(pagesToVisit);

//crawl();

// function crawl() {
//   if(numPagesVisited >= MAX_PAGES_TO_VISIT) {
//     console.log("Reached max limit of number of pages to visit.");
//     return;
//   }
//
//   var nextPage = pagesToVisit.pop();
//   if (nextPage) {
//     // savePageToVisit(pagesToVisit);
//     if (nextPage in pagesVisited) {
//       // crawl();
//     } else {
//       visitPage(nextPage, crawl);
//     }
//   } else {
//     console.log("Finish!!!");
//   }
// }

// function visitPage(url, callback) {
//   // Add page to our set
//   pagesVisited[url] = true;
//   numPagesVisited++;
//
//   // Make the request
//   console.log("Visiting page " + url);
//   var options = {
//     url: url,
//     headers: {
//       'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36'
//     }
//   }
//
//   request(options, function(error, response, body) {
//     // Check status code (200 is HTTP OK)
//
//     if (!response || response.statusCode !== 200) {
//       console.log("Response status code: ", response.statusCode);
//       // callback();
//       return;
//     }
//
//     console.log(url + ": " + response.statusCode);
//
//     // Parse the document body
//     var $ = cheerio.load(body);
//
//     var handler = new htmlparser.DomHandler(function (error, dom) {
//     }, {
//       verbose: true
//     });
//     var parser = new htmlparser.Parser(handler);
//     parser.write($.html());
//     parser.done();
//
//     var result = '';
//     result = walk(handler.dom);
//     console.log(JSON.stringify(result));
//
//     // callback();
//   });
// }

// function walk (dom, result) {
//
//   if (arguments.length < 2) {
// 		var result = {};
// 	}
//
//   _.each(dom, function(elem) {
// 		switch(elem.type) {
//       case 'tag':
//         switch(elem.name.toLowerCase()) {
//           case 'img':
//             if (!result['img']) {
//               result['img'] = []
//             }
//             var img = image(elem);
//             result['img'].push(img);
//             break;
//           case 'a':
// 						// Inline element needs its leading space to be trimmed if `result`
// 						// currently ends with whitespace
// 						// elem.trimLeadingSpace = whiteSpaceRegex.test(result);
//             if (!result['anchor']) {
//               result['anchor'] = []
//             }
//             var a = anchor(elem, walk);
// 						result['anchor'].push(a);
// 						break;
//           case 'p':
//             if (!result['paragraphs']) {
//               result['paragraphs'] = []
//             }
//             var p = paragraph(elem, walk);
// 						result['paragraphs'].push(p);
// 						break;
//           case 'h1':
// 					case 'h2':
// 					case 'h3':
// 					case 'h4':
// 					case 'h5':
// 					case 'h6':
//             if (!result['heading']) {
//               result['heading'] = []
//             }
//             var h = heading(elem, walk);
// 						result['heading'].push(h);
// 						break;
//           case 'br':
// 						// result += format.lineBreak(elem, walk, options);
// 						break;
// 					case 'hr':
// 						// result += format.horizontalLine(elem, walk, options);
// 						break;
// 					case 'ul':
// 						// result += format.unorderedList(elem, walk, options);
// 						break;
// 					case 'ol':
// 						// result += format.orderedList(elem, walk, options);
// 						break;
// 					case 'pre':
// 						// var newOptions = _(options).clone();
// 						// newOptions.isInPre = true;
// 						// result += format.paragraph(elem, walk, newOptions);
// 						break;
// 					case 'table':
// 						// if (containsTable(elem.attribs, options.tables)) {
// 						// 	result += format.table(elem, walk, options);
// 						// 	break;
// 						// }
//           default:
// 						result = walk(elem.children || [], result);
//         };
//         break;
//       case 'text':
// 			  if (elem.data.trim() !== '') {
// 					// Text needs its leading space to be trimmed if `result`
// 					// currently ends with whitespace
//           if (!result['text']) {
//             result['text'] = []
//           }
//           var t = text(elem);
//   				result['text'].push(t);
// 				}
// 				break;
//       default:
//         result = walk(elem.children || [], result);
//     }
//
//   });
//
//   return result;
//
// }

function text(elem) {
  // console.log(elem);
  // console.log(elem);
	// text = he.decode(text, options.decodeOptions);

	// if (options.isInPre) {
	// 	return text;
	// } else {
	// return helper.wordwrap(elem.trimLeadingSpace ? _s.lstrip(text) : text, options);
	// }
  var text = he.decode(elem.data.trim());
  return text;
}

function heading(elem, fn) {
  var heading = fn(elem.children);
  return heading
}

function paragraph(elem, fn) {
  // console.log("paragraph: ", elem.children);
  var p = fn(elem.children);
  return p;
}

// function image(elem) {
//   return elem.attribs.src
// }

function anchor(elem, fn) {
  var text = fn(elem.children || []);
	if (!text) {
		text = '';
	}
  if (elem.attribs && elem.attribs.href) {
		var href = elem.attribs.href.replace(/^mailto\:/, '');
	}
  return {
    href: href,
    text: text
  }
}

// function searchForWord($, word) {
//   var bodyText = $('html > body').text().toLowerCase();
//   return(bodyText.indexOf(word.toLowerCase()) !== -1);
// }
//
// function collectInternalLinks($) {
//     var relativeLinks = $("a[href^='/']");
//     console.log("Found " + relativeLinks.length + " relative links on page");
//     relativeLinks.each(function() {
//       pagesToVisit.push(baseUrl + $(this).attr('href'));
//     });
// }
//
// function collectImages($) {
//   var images = $("img");
//   console.log("Found " + images.length + " images on page");
//   images.each(function(value, element) {
//     console.log($(element).attr());
//   });
// }
//
// function collectText($) {
//   var text = htmlToText.fromString($.html(), {
//       wordwrap: 130,
//       ignoreImage: true,
//       ignoreHref: true
//   });
//   console.log(text);
// }
//
// function savePageToVisit(pagesToVisit) {
//   pagesToVisit.forEach(function(v) {
//     if(v) {
//       //console.log(v);
//       file.write(v + '\n');
//     }
//   });
// }
