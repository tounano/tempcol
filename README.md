# tempcol

Temporary collections for mongodb.

`tempcol` will create disposable collections on demand. The collections will be dropped once their consumption is done,
or based on an expiry option.

If the process was terminated before dropping the expired collections, the timers would be recreated next time the module
is called.

Temporary collections would have the following naming pattern:

```
  var name = prefix + separator + (expires + randomValue_range_0-1000);
```

Here's an example of a possible output: `tempcol_._1405844896029`

You can pass `prefix`, `separator` and `expires` in options. The default values are as follows:

*  `prefix` - tempcol
*  `separator` - _._
*  `expires` - now + 3600 (1 hour from now)

## Usage:

### var createTemporaryCollection = tempcol(db, options);

This will create a factory for temp collections.

#### args

*  `db` - An instance of the database.
*  `options` - (optional) An object with options.

**Options**

*  `prefix` - default is `tempcol`
*  `separator` - default is `_._`
*  `ttl` - (seconds). default is `3600`. can be overridden later.

####Example

```js
  var createTemporaryCollection = require('tempcol')(db, {ttl: 3600*24});
```

### createTemporaryCollection(opts, cb)

Will create a temporary collection.

#### args

*  `opts` - (optional) object with options.
*  `cb` - A callback that the temp collection would be injected to.

**callback args**

*  `err` - Like everything in node.
*  `collection` - The instance of the temp collection.
*  `done` - (optional). A callback you can trigger when you finished using the collection. It will drop the collection
immediately.

**options**

*  `ttl` - (seconds|optional). You can override the default value.
*  `expires` - (miliseconds|optional). You can specify an exact timestamp if you want. This will override `ttl`.

####example

```js
createTemporaryCollection(function (err, col, done) {
  if (err) throw err;

  col.insert({somekey: 'someid'}, function () {
    done();
  };
});
```

## install

With [npm](https://npmjs.org) do:

```
npm install tempcol
```

## license

MIT