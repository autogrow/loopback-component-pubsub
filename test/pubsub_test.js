

var Pubsub = require("../pubsub");
var expect = require("chai").expect;


var opts, msg;
var fakeSocket = {emit: function() {}};

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
  });

  it("should remove API root", function(done) {
    fakeSocket.emit = function(name) {
      expect(name).to.not.contain(opts.apiRoot);
      expect(name).to.contain("/rooms/1");
      done();
    };

    new Pubsub(fakeSocket, opts).publish(msg);
  });

  it("should upcase the method", function(done) {
    fakeSocket.emit = function(name) {
      expect(name).to.contain("[PUT]");
      done();
    };

    new Pubsub(fakeSocket, opts).publish(msg);
  });

  it("should send the data", function(done) {
    fakeSocket.emit = function(name, data) {
      expect(data).to.have.property("test");
      expect(data.test).to.equal(1);
      done();
    };

    new Pubsub(fakeSocket, opts).publish(msg);
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

      new Pubsub(fakeSocket, opts).publish(msg);
    });

  });

  describe("when next callback is given", function() {
    it("should call next", function(done) {
      new Pubsub(fakeSocket, opts).publish(msg, function() {
        done();
      });
    });
  });

});
