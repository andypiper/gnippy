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
  debug: nconf.get('DEBUG'),
  query: {
    query: 'andypiper'
  }
};

var search  = new Gnippy.Search.Twitter(options);

search.on('data', function(data){
  console.dir(JSON.stringify(data));
});

search.start();
