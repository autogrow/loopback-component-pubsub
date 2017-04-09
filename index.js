"use strict";

/**
 * Dependencies
 **/
var io = require("socket.io"),
  ioAuth = require("socketio-auth"),
  Pubsub = require("./pubsub"),
  debug = require("debug")("lc:pubsub"),
  NATS = require("nats");

/**
 * @module LoopBack Component PubSub
 * @author Jonathan Casarrubias <http://twitter.com/johncasarrubias>
 * @description
 *
 * This module integrates LoopBack with Socket IO in order to provide
 * PubSub functionallity.
 */
module.exports = (app, options) => {

  /**
   * Set Default Options
   */
  options = Object.assign({}, {
    auth: true,
    removeApiRoot: true,
    apiRoot: app.settings.restApiRoot,
    natsUrl: process.env.NATS_URL || app.settings.natsUrl || ""
  }, options);

  debug("Options from component config:", options);

  /**
   * Set Listener waiting for Http Server
   **/
  app.on("started", start);

  /**
   * Setup Real Time Communications
   **/
  function start(server) {
    debug("RTC server listening at %s", app.get("url").replace("http", "ws"));

    // Lets create an instance of IO and reference it in app
    var socket = io(server);
    var nats   = buildNatsClient(options);

    // close the engine to let the app server stop
    app.on("stopping", () => {
      debug("Attached server is stopping, closing pubsub engines");
      if ( socket ) socket.engine.close();
      if ( nats )   nats.close();
    });

    // Add a pubsub instanceable module
    app.pubsub = new Pubsub(socket, nats, options);

    // Configure ioAuth
    if (options.auth === true) {
      debug("RTC authentication mechanism enabled");

      ioAuth(socket, {
        authenticate: (ctx, token, next) => {
          var AccessToken = app.models.AccessToken;
          //verify credentials sent by the client
          token = AccessToken.find({
            where: { id: token.id || 0, userId: token.userId || 0 }
          }, (err, tokenInstance) => {
            next(err, tokenInstance.length > 0 ? true : false);
          });
        },
        postAuthenticate: () => {
          socket.on("authentication", value => {
            debug("A user (%s) has been authenticated over web sockets", value.userId);
          });
        }
      });
    }

    socket.on("connection", connection => {
      debug("A new client connected", connection.id);
      connection.on("lb-ping", () => connection.emit("lb-pong", new Date().getTime() / 1000));
    });
  }

  // this will build a NATS client and return it, even if it is not connected,
  // with reconnection and persistent reopening handled via the callbacks available
  // from the NATS client itself.  Publishes will still work but will fall into
  // the ether until the connection is re-established
  var buildNatsClient = function(options) {
    if ( options.natsUrl === "" || !options.natsUrl ) {
      return null;
    }

    var opts = {
      url: options.natsUrl,
      reconnect: true
    };

    if ( options.natsAuth ) {
      debug("Using nats authentication");
      opts.user = options.natsAuth.user;
      opts.pass = options.natsAuth.pass;
    }

    var nats = NATS.connect(opts);

    nats.on("connect", function() {
      debug("NATS connected on %s", options.natsUrl);
    });

    nats.on("reconnecting", function() {
      debug("NATS attempting reconnection to %s", options.natsUrl);
    });

    nats.on("error", function(err) {
      debug("NATS error: %s", err);

      if ( err.indexOf("ECONNREFUSED") ) {
        setTimeout(function() {
          debug("NATS attempting to re-open connection with %s", options.natsUrl)
          nats.parseOptions(opts);
          nats.initState();
          nats.createConnection();
        }, 2000)
      }
    });

    nats.on("close", function() {
      debug("NATS connection closed");

      if ( nats.closed ) return;

      debug("NATS attempting to re-open connection with %s", options.natsUrl)
      nats.parseOptions(opts);
      nats.initState();
      nats.createConnection();
    });

    nats.on("disconnect", function() {
      debug("NATS was disconnected");
    });

    nats.on("reconnecting", function() {
      debug("NATS is reconnecting");
    });

    return nats;
  };
};
