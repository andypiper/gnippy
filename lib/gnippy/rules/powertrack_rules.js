var _             = require('underscore');
var EventEmitter  = require('events').EventEmitter;
var http          = require('request');
var util          = require('util');

var RulesManager  = function(options){
  var that        = this;
  that.options    = options;

  EventEmitter.call(that);

// https://gnip-api.twitter.com/rules/powertrack/accounts/{ACCOUNT_NAME}/publishers/twitter/{STREAM_LABEL}.json

  var uri               = _.template("https://gnip-api.twitter.com/rules/powertrack/accounts/<%- account_name %>/publishers/twitter/<%- stream_name %>.json", that.options);
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
      if (res.body) {
        util.log(res.body);
      }
    }
    if(res.statusCode >= 200 && res.statusCode <= 299){
      if(res.statusCode === 201) {
        that.emit('success', 'Rule created.');
      }else{
        that.emit('success', true);
      }
    }else if(res.statusCode === 400) {
      that.emit('bad request', 'Bad request, this rule may already exist.');
    }else if(res.statusCode === 413) {
      that.emit('request_too_large', 'Your request is too large, try breaking your requests into smaller chunks.');
      that.emit('error', 'Your request is too large, try breaking your requests into smaller chunks.');
    }else if(res.statusCode === 422){
      that.emit('unprocessable_entity', 'Your rule is invalid. Message: '+res.body);
      that.emit('error', 'Your rule is invalid. Response Code: '+res.statusCode+'; Message: '+res.body);
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
      if(body){
        util.log(JSON.parse(body));
      }
    }
    if(res.statusCode >= 200 && res.statusCode <= 299){
      that.emit('success', body ? JSON.parse(body) : []);
    }else{
      that.emit('error', {code: res.statusCode, message: 'Rules could not be listed. Response Code: '+res.statusCode});
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
    method: 'POST',
    json:   {
      "rules":  _.flatten([rules_to_delete])
    }
  });
  rq_options.uri += "?_method=delete"

  that._req   = http(rq_options);
  that._req.on('response', function(res){
    if(that.options.debug){
      util.log(res.statusCode);
      if(res.body){
        util.log(res.body);
      }
    }
    if(res.statusCode >= 200 && res.statusCode <= 299){
      that.emit('success', true);
    }else{
      that.emit('error', {code: res.statusCode, message: 'Rules could not be removed. Response Code: '+res.statusCode});
    }
  });
};

module.exports  = RulesManager;
