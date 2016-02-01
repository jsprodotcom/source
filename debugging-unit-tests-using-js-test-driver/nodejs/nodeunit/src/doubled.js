//http://caolanmcmahon.com/posts/unit_testing_in_node_js
exports.calculate = function (num) {
  if (typeof num === 'number') {
    return num * 2;
  }
  else {
    throw new Error('Expected a number');
  }
};