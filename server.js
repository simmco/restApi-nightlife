require('./config/config');

var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var { mongoose } = require('./db/mongoose');
var Yelp = require('yelp');

var Bar = require('./models/bar');

var app = express();
mongoose.Promise = global.Promise;

const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var router = express.Router();

router.use(function(req, res, next) {
  console.log("Something is happening");
  next();
})

router.get('/', function(req, res) {
  res.json({ message: 'hooray! welcome to our api'});
})

router.route('/:location/bars')

  .get(function(req, res) {
    var location = req.params.location.toLowerCase();
    Bar.find({location: location}, function(err, docs) {
      if (!err){
          if(docs.length === 0) {
            res.json({message: 'api call must be done'})
          }
          res.send(docs);
      } else {throw err;}
    });
  })

  .post(function(req, res) {
    var location = req.params.location.toLowerCase();

    var yelp = new Yelp({
      consumer_key: 'Ot8Eg8l5T4Egm5fvcr5X8g',
      consumer_secret: 'S0d8Br9KjAc9F8OMj_q6oodL0jk',
      token: '2vcagDoheBViIZXL-PjNkAWMEIkEg0AP',
      token_secret: 'qZ9bI5BLaxUPmUt1E48xcYreUH4',
    });

    yelp.search({ term: 'bar', location: location })
    .then(function (data) {

      data.businesses.map((business) => {
        var bar = new Bar({
          location: location,
          name: business.name,
          img: business.image_url,
          snippet: business.snippet_text,
          visitors: []
        });
        Bar.findOne({location: bar.location, name: bar.name}, function(err,obj) {
            if(err) {
              res.send(err);
            }
            if(obj === null) {
              bar.save(function(err){if(err) res.send(err)});
            }
        })
      })
    }).then(() => {
      Bar.find({location: location}, function(err, docs) {
        if (!err){
            res.send(docs);
        } else {throw err;}
      });

    })
  })

router.route('/:location/bars/:bar_id')

    .get(function(req, res) {
      var id = req.params.bar_id;
      Bar.findById(id, function(err, bar) {
        if (err)
          res.send(err);

        bar.visitors = bar.visitors + 1;
        bar.save(function(err) {
          if (err)
            res.send(err);

            res.json({message: 'status updated'})
        })
      })
    })

// router.route('/bars/:bar_id')
//   .get(function(req, res) {
//     Bar.findById(req.params.bar_id, function(err, bar) {
//       if (err)
//         res.send(err);
//       res.json(bar)
//     })
//   })
//   .put(function(req, res) {
//     Bar.findById(req.params.bar_id, function (err, bar) {
//       if (err)
//         res.send(err);
//
//       bar.name = req.body.name;
//
//       bar.save(function(err) {
//         if (err)
//             res.send(err);
//
//           res.json({ message: 'Bear updated!!'})
//       });
//     });
//   });
  // .delete(function(req, res) {
  //
  // })

app.use('/api', router);

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});
