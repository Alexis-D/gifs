// TODO(alexis): use RB tree AVL tree rather than BS tree.
// TODO(alexis): concurrent access?
// TODO(alexis): implement update.

var _ = require('underscore');

var BSTree = function() {
    // Represent the whole tree.
    // Construct it using .fromArray, or with .insert.
    this.root = null;
  },
  Node = function(name, value) {
    // Represent a node.
    this.name = name;
    this.value = value;
    this.parent = this.left = this.right = null;
    this._leftSum = this._rightSum = 0.;
  };

BSTree.prototype.fromObject = function(object) {
  // Add all elements from array into the tree.
  var that = this;
  _.each(object, function(value, name) { that.insert(name, value); });
  return this;
};

BSTree.prototype.insert = function(name, value) {
  // Insert a single node in the tree.
  var node = new Node(name, value);

  if(this.root === null) {
    this.root = node;
    node.parent = null;
  }

  else {
    this.root.binarySearchTreeInsert(node);
  }
};

BSTree.prototype.pick = function() {
  if(this.root === null) {
    throw 'No element in the tree.';
  }

  return this.root.pick();
};

BSTree.prototype.toString = function() {
  var array = this.root === null ? [] : this.root.toArray();
  return '[' + array.join(', ') + ']';
};

Node.prototype.binarySearchTreeInsert = function(node) {
  // Insert the node as we would do in a 'normal' binary search tree.
  var insert = function(child, node) {
      if(this[child] === null) {
        this[child] = node;
        this.fixSums(node, node.value);
        node.parent = this;
      }

      else {
        this[child].binarySearchTreeInsert(node, node.value);
      }
    };

  insert.call(this, node.name < this.name ? 'left' : 'right', node);
};

Node.prototype.fixSums = function(node, value) {
  // Fix the left & right subtree sum.
  if(this.left === node) {
    this._leftSum += value;
  }

  else {
    this._rightSum += value;
  }

  if(this.parent !== null) {
    this.parent.fixSums(this, value);
  }
};

Node.prototype.pick = function() {
  // Pick a random element in the subtree according to weights probability.
  var pick = Math.random() * (this._leftSum + this.value + this._rightSum);

  if(pick < this._leftSum) {
    return this.left.pick();
  }

  else if(pick < this._leftSum + this.value) {
    return this.name;
  }

  return this.right.pick();
}

Node.prototype.toArray = function() {
  // Infix traversal of the tree, returning a sorted array of nodes.
  var result = [];

  if(this.left !== null) {
    result = result.concat(this.left.toArray());
  };

  result.push(this);

  if(this.right !== null) {
    result = result.concat(this.right.toArray());
  }

  return result;
};

Node.prototype.toString = function() {
  return '{' + this.name + ', ' + this.value + '}';
};

// TODO(alexis): learn how to do proper unittests with Node.js.
// Quick hack to check distribution with python :)
// Just :!node % | python3 in vim to see the magic.
// var object = {
//     'nine': 9,
//     'six': 6,
//     'three': 3,
//     'nineteen': 19,
//     'two': 2,
//     'eleven': 11,
//     'fourteen': 14,
//     'seven': 7,
//     'twelve': 12,
//     'four': 4,
//     'one': 1,
//   },
//   tree = (new BSTree()).fromObject(object);
//
// var picks = []
//
// for(var i = 0; i < 1000 * _.reduce(_.values(object), function(memo, num){ return memo + num; }, 0); ++i) {
//   picks.push("'" + tree.pick() + "'");
// }
//
// console.log('import collections; print(collections.Counter([' + picks.join(',') + ']))')

exports.BSTree = BSTree;
