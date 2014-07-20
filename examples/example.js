var Engine = require("tingodb")();
var db = new Engine.Db(__dirname + '/tingodb',{});

var createTemporaryCollection = require('../')(db);
var col = db.collection('normalCollection');

createTemporaryCollection({ttl:20},function (err, tcol, done) {
  col.insert({a:'b'});
  tcol.insert({c:'d'});

  tcol.find().stream().on('data', function (data) {
    console.log(data)
  }).on('end', function () {
      done();
    });


})