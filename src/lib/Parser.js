"use strict";

import htmlparser from "htmlparser2";
import _ from "underscore";
import he from "he";

var MAX_PAGES_TO_VISIT = 50;
var numPagesVisited = 0;

export default class {
  parse(html) {
    var handler = new htmlparser.DomHandler(function(error, dom) {}, {
      verbose: true
    });

    var parser = new htmlparser.Parser(handler);
    parser.write(html);
    parser.done();

    var result = this.walk(handler.dom);
    return result;
  }

  walk(dom, result) {
    if (arguments.length < 2) {
      var result = {
        images: [],
        anchors: [],
        headings: [],
        texts: []
      };
    }
    _.each(dom, elem => {
      switch (elem.type) {
        case "tag":
          switch (elem.name.toLowerCase()) {
            case "img":
              var imgSrc = elem.attribs.src;
              if (typeof imgSrc != "undefined") {
                result["images"].push(imgSrc);
              }
              break;
            case "a":
              var a = this.anchor(elem, this.walk.bind(this));
              if (a) {
                result["anchors"].push(a);
              }
              this.walk(elem.children || [], result);
              break;
            case "h1":
            case "h2":
            case "h3":
            case "h4":
            case "h5":
            case "h6":
              var h = this.heading(elem, this.walk.bind(this));
              if (h) {
                result["headings"].push(h);
              }
              this.walk(elem.children || [], result);
              break;
            default:
              this.walk(elem.children || [], result);
            // result.images = result.images.concat(partialResult.images);
            // result.anchors = result.anchors.concat(partialResult.anchors);
            // result.headings = result.headings.concat(partialResult.headings);
            // result.texts = result.texts.concat(partialResult.texts);
          }
          break;
        case "text":
          if (elem.data.trim() !== "") {
            var t = this.text(elem);
            result["texts"].push(t);
          }
          break;
        default:
          this.walk(elem.children || [], result);
        // result.images = result.images.concat(partialResult.images);
        // result.anchors = result.anchors.concat(partialResult.anchors);
        // result.headings = result.headings.concat(partialResult.headings);
        // result.texts = result.texts.concat(partialResult.texts);
      }
    });
    return result;
  }

  image(elem) {
    return elem.attribs.src;
  }

  anchor(elem, fn) {
    // se l'anchor non ha href???
    if (elem.attribs && elem.attribs.href) {
      if (elem.attribs.href.trim() !== "#") {
        var content = fn(elem.children || []);
        var res = {};
        if (content.texts) {
          res.texts = content.texts;
        }
        if (
          content.images.length > 0 && typeof content.images[0] != "undefined"
        ) {
          res.images = content.images;
        }
        if (content.headings) {
          res.headings = content.headings;
        }
        res.href = elem.attribs.href.replace(/^mailto\:/, "").trim();
        return res;
      }
    }
    return null;
  }

  text(elem) {
    var text = he.decode(elem.data.trim());
    return text;
  }

  heading(elem, fn) {
    var res = {};
    res.name = elem.name;
    var content = fn(elem.children);
    if (content.text) {
      res.text = content.text;
    } else if (content.anchors) {
      res.anchors = content.anchors;
    }
    return res;
  }
}
