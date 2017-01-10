

var Pubsub = require("../pubsub");
var expect = require("chai").expect;

var opts, msg;
var fakeSocket = {emit: function() {}};
var fakeNats = {publish: function() {}};

describe("pubsub bridge", function() {

  beforeEach(function() {
    opts = {
      removeApiRoot: true,
      apiRoot: "/api/v0"
    };

    msg = {
      endpoint: "/api/v0/rooms/1",
      method: "put",
      data: {test: 1}
    };

    fakeSocket.emit = function() {};
    fakeNats.publish = function() {};
  });

  it("should ignore invalid message", function(done) {
    var token = setTimeout(done, 700);
    fakeSocket.emit = function() {
      done(new Error("invalid message was sent"));
      clearTimeout(token);
    };

    var p = new Pubsub(fakeSocket, null, opts);
    p.publish({endpoint: "fff"});
    p.publish({endpoint: "fff", method: "PUT"});
    p.publish({endpoint: "fff", data: {test:1}});
    p.publish({method: "fff", data: {test:1}});
  });

  describe("socket.io client", function() {

    it("should remove API root", function(done) {
      fakeSocket.emit = function(name) {
        expect(name).to.not.contain(opts.apiRoot);
        expect(name).to.contain("/rooms/1");
        done();
      };

      new Pubsub(fakeSocket, null, opts).publish(msg);
    });

    it("should upcase the method", function(done) {
      fakeSocket.emit = function(name) {
        expect(name).to.contain("[PUT]");
        done();
      };

      new Pubsub(fakeSocket, null, opts).publish(msg);
    });

    it("should send the data", function(done) {
      fakeSocket.emit = function(name, data) {
        expect(data).to.have.property("test");
        expect(data.test).to.equal(1);
        done();
      };

      new Pubsub(fakeSocket, null, opts).publish(msg);
    });

    describe("when the api root removal is disabled", function() {

      beforeEach(function() {
        opts = {
          removeApiRoot: false,
          apiRoot: "/api/v0"
        };

        fakeSocket.emit = function() {};
      });

      it("should not remove the api root", function(done) {
        fakeSocket.emit = function(name) {
          expect(name).to.contain(opts.apiRoot);
          expect(name).to.contain("/rooms/1");
          done();
        };

        new Pubsub(fakeSocket, null, opts).publish(msg);
      });

    });

  });

  describe("NATS client", function() {

    it("should send the data", function(done) {
      fakeNats.publish = function(name, data) {
        data = JSON.parse(data);
        expect(data).to.have.property("test");
        expect(data.test).to.equal(1);
        done();
      };

      new Pubsub(null, fakeNats, opts).publish(msg);
    });

    it("should build correct subject", function(done) {
      fakeNats.publish = function(name) {
        expect(name).to.equal("PUT.rooms.1");
        done();
      };

      new Pubsub(null, fakeNats, opts).publish(msg);
    });

  });

  describe("when next callback is given", function() {
    it("should call next", function(done) {
      new Pubsub(fakeSocket, null, opts).publish(msg, function() {
        done();
      });
    });
  });

});
