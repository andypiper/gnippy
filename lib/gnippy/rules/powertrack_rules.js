var _             = require('underscore');
var EventEmitter  = require('events').EventEmitter;
var http          = require('request');
var util          = require('util');

var RulesManager  = function(options){
  var that        = this;
  that.options    = _.extend({platform: 'twitter'}, options);

  EventEmitter.call(that);

  var uri               = _.template("https://api.gnip.com:443/accounts/<%- account_name %>/publishers/<%- platform %>/streams/track/prod/rules.json", that.options);
  that.request_options  =  {
    uri:        uri,
    auth:       {
      user:     options.user,
      pass:     options.password
    },
    gzip:       true,
    headers:    {
      "Content-Type":  "application/json"
    }
  };

  that._req     = null;
};
util.inherits(RulesManager, EventEmitter);

RulesManager.prototype.add  = function(new_rules){
  var that      = this;

  if(_.isEmpty(that.options.account_name)){
    throw new Error('You must include a Gnip account name.');
  }

  if(_.isEmpty(_.compact([that.options.user, that.options.password]))){
    throw new Error('Missing account credentials.');
  }

  var rq_options  = _.extend(that.request_options, {
    method: 'POST',
    json:   {
      "rules":  _.flatten([new_rules])
    }
  });

  that._req   = http(rq_options);
  that._req.on('response', function(res){
    if(that.options.debug){
      util.log(res.statusCode);
      util.log(res.body);
    }
    if(res.statusCode >= 200 && res.statusCode <= 299){
      that.emit('success', true);
    }else if(res.statusCode === 413){
      that.emit('request_too_large', 'Your request is too large, try breaking your requests into smaller chunks.');
      that.emit('error', 'Your request is too large, try breaking your requests into smaller chunks.');
    }else{
      that.emit('error', 'New rules could not be added. Response Code: '+res.statusCode);
    }
  });
};

RulesManager.prototype.list = function(){
  var that      = this;

  if(_.isEmpty(that.options.account_name)){
    throw new Error('You must include a Gnip account name.');
  }

  if(_.isEmpty(_.compact([that.options.user, that.options.password]))){
    throw new Error('Missing account credentials.');
  }

  var rq_options  = _.omit(_.extend(that.request_options, { method: 'GET' }),'headers');

  http(rq_options, function(error, res, body){
    if(that.options.debug){
      util.log(res.statusCode);
      util.log(JSON.parse(body));
    }
    if(res.statusCode >= 200 && res.statusCode <= 299){
      that.emit('success', JSON.parse(body));
    }else{
      that.emit('error', 'Rules could not be listed. Response Code: '+res.statusCode);
    }
  });
};

RulesManager.prototype.remove  = function(rules_to_delete){
  var that      = this;

  if(_.isEmpty(that.options.account_name)){
    throw new Error('You must include a Gnip account name.');
  }

  if(_.isEmpty(_.compact([that.options.user, that.options.password]))){
    throw new Error('Missing account credentials.');
  }

  var rq_options  = _.extend(that.request_options, {
    method: 'DELETE',
    json:   {
      "rules":  _.flatten([rules_to_delete])
    }
  });

  that._req   = http(rq_options);
  that._req.on('response', function(res){
    if(that.options.debug){
      util.log(res.statusCode);
      util.log(res.body);
    }
    if(res.statusCode >= 200 && res.statusCode <= 299){
      that.emit('success', true);
    }else{
      that.emit('error', 'Rules could not be removed. Response Code: '+res.statusCode);
    }
  });
};

module.exports  = RulesManager;