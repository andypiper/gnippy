// var _       = require('underscore');
var nconf   = require('nconf');
var Gnippy  = require('gnippy');

// load config
nconf.file({ file: 'config.json' }).env();

// setup API client options
var options = {
  account_name: nconf.get('ACCOUNT_NAME'),
  user: nconf.get('USER'),
  password: nconf.get('PASSWORD'),
  stream_name: nconf.get('STREAM_NAME'),
  debug: nconf.get('DEBUG')
};

var mgr  = new Gnippy.Powertrack.Rules(options);

var newrule = { "value": "#dogs", "tag": "fun" };
// var delrule = { "id": 859347783144353800 };

mgr.add(newrule, function(err){
  console.error(err);
});

// mgr.remove(delrule, function(err){
//   console.error(err);
// });

// mgr.list();
