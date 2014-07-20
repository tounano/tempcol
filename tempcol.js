var _ = require('underscore');

var defaults = {
  prefix: 'tempcol',
  ttl: 3600,
  separator: '_._'
}

module.exports = function TempColManager(db, options) {
  options = _.defaults(options || {}, defaults);

  restoreExpiryTimers(db, options);

  return function createTemporaryCollection(opts, cb) {
    if (typeof opts == 'function') {
      cb = opts;
      opts = {};
    }
    opts = _.defaults(opts, options);
    opts.expires = opts.expires || new Date().getTime() + (opts.ttl*1000);

    var name = opts.prefix + opts.separator + (opts.expires + Math.round(Math.random()*1000));
    var timer = setTimeout(function(){ db.dropCollection(name, function(){}) }, opts.expires - new Date().getTime())

    db.createCollection(name, opts, function (err, collection) {
      cb(err, collection, _done)
    })

    function _done(){
      db.dropCollection(name, function(){});
      clearTimeout(timer);
    }
  }
}

function findTempCollections(db, opts, cb) {
  db.collectionNames( function (err, results) {
    if (err) return cb(err);
    var tempCollections = [];


    _.each(results, function (val) {
      if (val.name.search(opts.prefix + opts.separator) !== -1)
        tempCollections.push(val.name.substr(val.name.search('tempcol_._')));
    })

    cb(null, tempCollections);
  })
}

function filterInExpiredCollections(tempCollections) {
  var results = [];
  var now = new Date().getTime();
  _.each(tempCollections, function (name) {
    var expires = getExpiresFromCollectionName(name);
    if (expires && expires - now <= 0) results.push(name);
  })

  return results;
}

function getExpiresFromCollectionName(name) {
  var regex = new RegExp(/\d{13,13}$/g);
  var expires = name && name.match(regex);
  expires = expires && expires.length && expires[0];
  return expires;
}

function restoreExpiryTimers(db, opts) {
  findTempCollections(db, opts, function (err, results) {
    if (err) return;
    _.each(results, function (colName) {
      var now = new Date().getTime();
      var ttl = getExpiresFromCollectionName(colName)-now;

      ttl = ttl > 0 ? ttl : 0;
      setTimeout( function () {
        db.collection(colName, function (err, col) {
          if (err) return;
          col.drop(function(){});
        })
      }, ttl)
    })
  })
}