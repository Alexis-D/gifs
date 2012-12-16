var redis = require('redis');

var client = redis.createClient();

var confidence = function(ups, downs) {
    // http://stackoverflow.com/a/10029645
    var n = ups + downs;

    if(!n) {
      return 0;
    }

    var z = 1.6, // 95%
      phat = ups / n;

    return Math.sqrt(
        phat + z * z / (2 * n) -
        z* ((
            phat * (1 - phat) +
            z * z / (4 * n)
          ) / n)
        ) / (1 + z * z / n);
  },
  score = function(id) {
    // silent if error ('cause it doesn't matter)...

    // update the score of the gif designated by id
    client.mget(
        'gifs:' + id + ':ups',
        'gifs:' + id + ':downs',
        function(err, reply) {
          if(!err && reply !== null) {
            var ups = reply[0],
              downs = reply[1];

            client.set(
              'gifs:' + id + ':score',
              confidence(ups, downs),
              redis.print
              );
          }
        }
        );
  };

exports.score = score;
