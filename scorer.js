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
  _score = function(id) {
    // update the score of the gif designated by id
    client.get('gifs:' + id + ':ups', function(err, reply) {
      if(!err && reply !== null) {
        var ups = parseInt(reply, 10);

        client.get('gifs:' + id + ':downs', function(err, reply) {
          if(!err && reply !== null) {
            var downs = parseInt(reply, 10);

            client.set(
              'gifs:' + id + ':score',
              confidence(ups, downs),
              redis.print
              );
          }
        });
      }
    });
  },
  score = function(id, ups, downs) {
    // silent if error ('cause it doesn't matter)...

    // FIXME(alexis): this is a ugly kludge to go around async redis call
    if(ups !== undefined && downs !== undefined) {
      client.set(
          'gifs:' + id + ':score',
          confidence(ups, downs),
          redis.print
          );
    }

    else {
      _score(id);
    }
  };

exports.score = score;
