"use strict";

var debug = require("debug")("lc:pubsub");

module.exports = function Pubsub(socket, nats, options) {
  debug("pubsub object created with options:", options);
  if ( nats )   { debug("socket client given"); }
  if ( socket ) { debug("nats client given");   }

  var publishNats = function(msg) {
    if ( !nats ) return false;
    var subject = parseNatsSubject(msg.method, msg.endpoint);
    nats.publish(subject, JSON.stringify(msg.data));
  };

  var publishSocketIO = function(msg) {
    if ( !socket ) return false;
    var channel = `[${msg.method}]${msg.endpoint}`;
    socket.emit(channel, msg.data);
  };

  Pubsub.prototype.publish = function publish(msg, next) {
    debug("told to publish message: ", msg);

    if ( !isValidMessage(msg) ) {
      debug("Error: Option must be an instance of type { method: string, endpoint: string, data: object }");
      debug("Invalid message: ", msg);
      next && next();
      return;
    }

    // remove query params from the endpoint
    if (msg.endpoint.match(/\?/)) {
      msg.endpoint = msg.endpoint.split("?").shift();
    }

    // remove the api root from the front of the URL
    if ( options.removeApiRoot === true ) {
      msg.endpoint = msg.endpoint.replace(options.apiRoot, "");
    }

    // always make the method upper case
    msg.method = msg.method.toUpperCase();

    debug("publishing message %s %s", msg.method, msg.endpoint);
    debug("message data:", msg.data);

    publishNats(msg);
    publishSocketIO(msg);

    next && next();
  };
};

var isValidMessage = function(msg) {
  return (msg && msg.method && msg.endpoint && msg.data);
};

var parseNatsSubject = function(method, endpoint) {
  var sub = [method.toUpperCase()];
  endpoint.split("/").forEach(function(bit) {
    if ( bit == "" ) return;
    sub.push(bit);
  });

  return sub.join(".");
};
