var nconf = require('nconf');
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

var stream  = new Gnippy.Powertrack.Stream(options);

stream.on('error', function(err){
  console.error(err);
});

stream.on('data', function(data){
  console.dir(JSON.stringify(data));
});

stream.on('post', function(data){
  console.dir(JSON.stringify(data));
});

stream.on('share', function(data){
  console.dir(JSON.stringify(data));
});

stream.start();
