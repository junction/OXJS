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

    var doc = OXTest.DOMParser.parse(this.conn._data);

    Assert.areSame('set',
                   doc.getPathValue('/iq/@type'),
                   'iq type when subscribing is not "set"');
    Assert.areSame('pubsub.directories.xmpp.onsip.com',
                   doc.getPathValue('/iq/@to'),
                   'iq to when subscribing is not "pubsub.directories.xmpp.onsip.com"');
    Assert.areSame('/me/jid',
                   doc.getPathValue('/iq/ps:pubsub/ps:subscribe/@node'),
                   'subscribe node is not "/me/jid"');
    Assert.areSame('enoch@example.com',
                   doc.getPathValue('/iq/ps:pubsub/ps:subscribe/@node'),
                   'subscribe jid is not "enoch@example.com"');

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
