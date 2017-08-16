"use strict"

import _ from 'underscore';

export default class {
  parse(tree)  {
      var result = this.walk(tree, 0);
      //console.log("result: ", result);
  }

  walk(tree, result) {
    _.each(tree, (node) => {
        if (!node.length){
          result += ", " + node;
        } else {
          result = this.walk(node, result);
        }
    });
    return result;
  }
}
