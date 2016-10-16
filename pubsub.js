"use strict";

var debug = require("debug")("lc:pubsub");

module.exports = function Pubsub(socket, OPTIONS) {
  Pubsub.prototype.publish = function publish(options, next) {
    if (options && options.method && options.endpoint && options.data) {

      // remove query params from the endpoint
      if (options.endpoint.match(/\?/)) {
        options.endpoint = options.endpoint.split("?").shift();
      }

      if ( OPTIONS.removeApiRoot === true ) {
        options.endpoint = options.endpoint.replace(OPTIONS.restApiRoot, "");
      }

      // always make the method upper case
      options.method = options.method.toUpperCase();

      // build the channel that the message will go to
      var event = `[${options.method}]${options.endpoint}`;

      debug("Sending message to", event);
      debug("message", options.data);

      socket.emit(event, options.data);
      next && next();
    } else {
      debug(options);
      debug("Error: Option must be an instance of type { method: string, endpoint: string, data: object }");
      next && next();
    }
  };
};
