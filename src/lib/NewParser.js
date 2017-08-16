"use strict";

import htmlparser from 'htmlparser2';
import _ from 'underscore';
import he from 'he';

export default class {

  parse(html) {

    var handler = new htmlparser.DomHandler(function (error, dom) {}, {
      verbose: true
    });

    var parser = new htmlparser.Parser(handler);
    parser.write(html);
    parser.done();

    return this.walk(handler.dom, {texts: [], images: [], anchors: [], headings: []});
  }

  walk(dom, result) {
    _.each(dom, (elem) => {
      if (typeof elem != 'undefined') {
        switch(elem.type) {
          case 'tag':
            switch (elem.name.toLowerCase()){
              case 'img':
                this.walkImage(elem, result);
                break;
              case 'a':
                result = this.walkAnchor(elem, result);
                break;
              case 'h1':
              case 'h2':
              case 'h3':
              case 'h4':
              case 'h5':
              case 'h6':
                result = this.walkHeading(elem, result);
                break;
              default:
                result = this.walk(elem.children, result);
            }
            break;
          case 'text':
            if(elem.data.trim() != '') {
              // visit text
              result.texts.push(elem.data.trim());
            }
            break;
        }
      }
    });

    return result;
  }

  walkAnchor(anchor, result) {
    var partialResult = this.walk(anchor.children, {texts: [], images: [], anchors: [], headings: []});

    if (anchor.attribs.href && anchor.attribs.href.indexOf('#') !== -1) {
      return result;
    }

    result.anchors.push({href: anchor.attribs.href});
    result.texts = result.texts.concat(partialResult.texts);
    result.images = result.images.concat(partialResult.images);
    result.headings = result.headings.concat(partialResult.headings);

    return result;
  }

  walkHeading(heading, result) {
    var partialResult = this.walk(heading.children, {texts: [], images: [], anchors: [], headings: []});
    result.headings.push({
      name: heading.name,
      texts: partialResult.texts
    });
    result.images = result.images.concat(partialResult.images);
    result.anchors = result.anchors.concat(partialResult.anchors);

    return result;
  }

  walkImage(image, result) {
    var src;
    //var url = relativeToAbsolute(image.attribs.src);
    if (image.attribs.src){
      src = image.attribs.src;
    } else if (image.attribs['data-delayed-url']){
      src = image.attribs['data-delayed-url'];
    }
    var alt = image.attribs.alt;
    result.images.push({src: src, alt: alt});
    //return [ ...result, {src: image.attribs.src, alt: image.attribs.alt} ]
  }
}
