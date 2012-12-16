var crypto = require('crypto'),
  express = require('express'),
  redis = require('redis'),
  request = require('request'),
  scorer = require('./scorer'),
  url = require('url'),
  _ = require('underscore');

require('jinjs').registerExtension('.tpl');
_.str = require('underscore.string');

var app = express(),
  client = redis.createClient();

_.map([
    express.bodyParser(),
    express.compress(),
    express.logger(),
    express.static('static/'),
    ], function(middleware) { app.use(middleware); });

app.get('/', function(req, res) {
  client.srandmember('gifs', function(err, reply) {
    if(err || reply === null) {
      res.status(500);
      res.send('wtf?!');
    }

    else {
      var id = reply;

      client.get('gifs:' + id, function(err, reply) {
        if(err || reply === null) {
          res.status(500);
          res.send('wtf?!');
        }

        res.send(require('./templates/index').render({
          'url': reply,
          'id': id,
        }));
      });
    }
  });
});

app.post('/vote', function(req, res) {
  // TODO(alexis): disallow user to vote for this gif.

  if(_.contains(['up', 'down'], req.body.vote)) {
    client.incr('gifs:' + req.body.id + ':' + req.body.vote + 's', function(err, reply) {
      scorer.score(req.body.id);
    });
  }

  res.redirect('/');
});

app.get('/submit', function(req, res) {
  res.send(require('./templates/submit').render({}));
});

app.post('/submit', function(req, res) {
  var imgUrl = req.body.url;

  if(!_.str.endsWith(imgUrl.toLowerCase(), '.gif')) {
    imgUrl += '.gif';
  }

  if(!_.contains(['i.imgur.com', 'imgur.com'], url.parse(imgUrl).hostname)) {
      return res.send(require('./templates/submit').render({
        'invalid': true,
        'message': 'This was not a link to imgur.',
        'url': req.body.url,
      }));
  }

  request(imgUrl, function(err, response, body) {
    if(!err && response.statusCode == 200) {
      if(_.str.startsWith(body, 'GIF87a')
        || _.str.startsWith(body, 'GIF89a')) {
          var sha1 = crypto.createHash('sha1');
          sha1.update(imgUrl);

          var id = sha1.digest('hex');

          res.redirect('/gif/' + id);

          // TODO(alexis): disallow user to vote for this gif (check if already voted btw).
          // (incr if already submitted but not voted by current user)
          client.msetnx(
            'gifs:' + id, imgUrl,
            'gifs:' + id + ':ups', 1,
            'gifs:' + id + ':downs', 0,
            function(err, reply) {
              if(!err) {
                scorer.score(id);
                client.sadd('gifs', id, redis.print);
              }
            }
          )
      }
    }

    else {
      res.send(require('./templates/submit').render({
        'invalid': true,
        'message': 'Something weird happened, is imgur down?',
        'url': req.body.url,
      }));
    }
  });
});

app.get('/gif/:id', function(req, res) {
  client.get('gifs:' + req.params.id, function(err, reply) {
    if(err || reply === null) {
      res.status(404);
      res.send('404');
      // check if just submitted?
    }

    else {
      res.send(require('./templates/display').render({
        'url': reply,
        'id': req.params.id,
      }));
    }
  });
});

app.get('/best', function(req, res) {
  // TODO(alexis): use a sorted set (z*) to keep track of best gifs so far?
  res.status(500);
  res.send('/');
});

app.get('/about', function(req, res) {
  res.status(500);
  res.send('/');
});

app.listen(3333);

