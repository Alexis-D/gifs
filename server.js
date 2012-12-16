var crypto = require('crypto'),
  express = require('express'),
  redis = require('redis'),
  request = require('request'),
  scorer = require('./scorer'),
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
  // TODO(alexis): template this!

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

        res.send(require('./templates/index.tpl').render({
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
  res.send(require('./templates/submit.tpl').render({}));
});

app.post('/submit', function(req, res) {
  var url = req.body.url;

  if(!_.str.endsWith(url.toLowerCase(), '.gif')) {
    url += '.gif';
  }

  // TODO(alexis): check if the domain of the url is imgur

  request(url, function(err, response, body) {
    if(!err && response.statusCode == 200) {
      if(_.str.startsWith(body, 'GIF87a')
        || _.str.startsWith(body, 'GIF89a')) {
          var sha1 = crypto.createHash('sha1');
          sha1.update(url);

          var id = sha1.digest('hex');

          res.redirect('/gif/' + id);

          // TODO(alexis): send all command at once.
          // TODO(alexis): check if the gif is already in the DB,
          // otherwise security hole (could reset up/down to 0).
          // TODO(alexis): disallow user to vote for this gif.
          client.set('gifs:' + id, url, redis.print);
          client.set('gifs:' + id + ':ups', 1, redis.print);
          client.set('gifs:' + id + ':downs', 0, redis.print);
          client.sadd('gifs', id, redis.print)
          scorer.score(id, 1, 0);
      }
    }

    else {
      res.send(require('./templates/submit.tpl').render({
        'invalid': true,
        'url': req.body.url,
      }));
    }
  });
});

app.get('/gif/:id', function(req, res) {
  // TODO(alexis): template this!

  client.get('gifs:' + req.params.id, function(err, reply) {
    if(err || reply === null) {
      res.status(404);
      res.send('404');
      // check if just submitted?
    }

    else {
      res.send(reply);
    }
  });
});

app.get('/best', function(req, res) {
  res.status(500);
  res.send('/');
});

app.get('/about', function(req, res) {
  res.status(500);
  res.send('/');
});

app.listen(3333);

