"use strict";

var debug = require("debug")("lc:pubsub");

module.exports = function Pubsub(socket) {
  Pubsub.prototype.publish = function publish(options, next) {
    if (options && options.method && options.endpoint && options.data) {

      if (options.endpoint.match(/\?/)) {
        options.endpoint = options.endpoint.split("?").shift();
      }

      var event = `[${options.method}]${options.endpoint}`;

      debug("Sending message to", event);
      debug("message", options.data);

      socket.emit(event, options.data);
      next();
    } else {
      debug(options);
      debug("Error: Option must be an instance of type { method: string, data: object }");
      next();
    }
  };
};
