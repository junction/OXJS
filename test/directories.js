OXTest.Directories = new YAHOO.tool.TestCase({
  name: 'Directories Tests',

  _should: {
    /*
     * Don't target any directories tests for now.
     */
    ignore: {
      testServiceMixin:   true,
      testPubSubURI:      true,
      testItemFromPacket: true
    }
  },

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
    Assert.areSame(this.ox,           this.ox.Directories.connection);
  },

  testPubSubURI: function () {
    var Assert = YAHOO.util.Assert;

    Assert.areSame('xmpp:pubsub.directories.xmpp.onsip.com',
                   this.Directories.pubSubURI,
                   'Directories.pubSub URI is wrong.');
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
  }
});

YAHOO.tool.TestRunner.add(OXTest.Directories);
