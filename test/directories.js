OXTest.Directories = new YAHOO.tool.TestCase({
  name: 'Directories Tests',

  setUp: function () {
    this.conn = OXTest.ConnectionMock.extend();
    this.ox = OX.Connection.extend({connection: this.conn});
    this.ox.initConnection();
    this.Directories = this.ox.Directories;

    this.successFlag = false;
    this.errorFlag = false;
    this.subHandlers = {
      onSuccess: function (requestedURI, finalURI) {
        this.successFlag = true;
        Assert.areSame('/',       requestedURI);
        Assert.areSame('/me/jid', finalURI);
      },

      onError: function (requestedURI, finalURI) {
        this.errorFlag = true;
        Assert.areSame('/',       requestedURI);
        Assert.areSame('/me/jid', finalURI);
      }
    };
  },

  tearDown: function () {
    delete this.conn;
    delete this.ox;
    delete this.Directories;
    delete this.successFlag;
    delete this.errorFlag;
    delete this.subHandlers;
  },

  testServiceMixin: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isObject(OX.Services.Directories,
                    'Directories mixin is not available');
    Assert.isObject(this.Directories, 'Directories is not initialized');
    Assert.areSame(this.conn,         this.ox.Directories.connection);
  },

  testItemFromPacket: function () {
    var Assert = YAHOO.util.Assert;

    var itemXML = '';
    Assert.isFunction(this.Directories.itemFromPacket,
                      'Directory service cannot turn packet into item.');
    var packet = OXTest.Message.extend({
      from: 'user-agents.xmpp.onsip.com',
      to:   'me@example.com',
      doc:  OXTest.DOMParser.parse(itemXML)
    });
    var item = this.Directories.itemFromPacket(packet);
    Assert.isObject(item, 'Directories.itemFromPacket did not return an object.');
    Assert.areSame(this.conn, item.connection,
                   'Directory item connection is wrong.');
  },

  testSubscribe: function () {
    var Assert = YAHOO.util.Assert;
    this.Directories.subscribe('/me/jid', {
      onSucess: function (requestedURI, finalURI) {
        this.successFlag = true;
        Assert.areSame(requestedURI, finalURI,
                       'requested and final uri differ when successful.');
        Assert.areSame('/me/jid', requestedURI,
                       'requestedURI is not actual requested uri');
      },

      onError: function (requestedURI, finalURI) {
        this.errorFlag = true;
        Assert.areSame(requestedURI, finalURI,
                       'requested and final uri differ on error.');
        Assert.areSame('/me/jid', requestedURI,
                       'requestedURI is not actual requested uri');
      }
    });

    Assert.isSubscribe(this.conn._data, 'pubsub.directories.xmpp.onsip.com',
                       '/', 'test@example.com');

    Assert.areSame(false, this.errorFlag,
                   'Got error trying to subscribe to /');
    Assert.areSame(true,  this.successFlag,
                   'Was not successful trying to subscribe to /');
  },

  testRedirect: function () {
    var Assert = YAHOO.util.Assert;

    this.Directories.subscribe('/', this.subHandlers);

    Assert.areSame(false, this.errorFlag,
                   'Got error trying to subscribe to /');
    Assert.areSame(true,  this.successFlag,
                   'Was not successful trying to subscribe to /');
  }
});

YAHOO.tool.TestRunner.add(OXTest.Directories);
