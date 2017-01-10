"use strict";

var debug = require("debug")("lc:pubsub");

module.exports = function Pubsub(socket, nats, options) {
  Pubsub.prototype.publish = function publish(msg, next) {
    debug("told to publish message: ", msg);

    if (msg && msg.method && msg.endpoint && msg.data) {

      // remove query params from the endpoint
      if (msg.endpoint.match(/\?/)) {
        msg.endpoint = msg.endpoint.split("?").shift();
      }

      if ( options.removeApiRoot === true ) {
        msg.endpoint = msg.endpoint.replace(options.apiRoot, "");
      }

      // always make the method upper case
      msg.method = msg.method.toUpperCase();

      // build the channel that the message will go to
      var event = `[${msg.method}]${msg.endpoint}`;

      debug("Sending message to", event);
      debug("message", msg.data);

      socket.emit(event, msg.data);
      next && next();
    } else {
      debug(msg);
      debug("Error: Option must be an instance of type { method: string, endpoint: string, data: object }");
      next && next();
    }
  };
};
