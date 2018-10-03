'use strict';

import htmlparser from 'htmlparser2';
import _ from 'underscore';

export default class SimpleRecursor {
  parse(html) {
    var handler = new htmlparser.DomHandler(function(error, dom) {}, {
      verbose: true
    });

    var parser = new htmlparser.Parser(handler);
    parser.write(html);
    parser.done();

    return this.walk(handler.dom, '');
  }

  walk(tree, result) {
    _.each(tree, node => {
      console.log(node);
      console.log('*******************************');
      // if (node.length) {
      //   result += ', ' + node;
      // } else {
      //   //result = this.walk(node, result);
      //   //console.log(result);
      // }
    });
    return result;
  }
}
