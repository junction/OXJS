OXTest.Directories = new YAHOO.tool.TestCase({
  name: 'Directories Tests',

  itemXML: {
    user: '<message from="pubsub.directories.xmpp.onsip.com" type="headline" to="jgreen!example.onsip.com@my.onsip.com" >'
          + '<event xmlns="http://jabber.org/protocol/pubsub#event">'
          + '<items node="/example.onsip.com/user" >'
          + '<item id="hiro" >'
          + '<entity xmlns="onsip:xmpp:directories" publish-time="2009-11-23T23:28:22Z">'
          + '<sip-uri>sip:hiro@example.onsip.com</sip-uri>'
          + '<name>Hiro Protagonist</name>'
          + '</entity>'
          + '</item>'
          + '</items>'
          + '</event>'
          + '<header name="Collection" >/me/jgreen!example.onsip.com@my.onsip.com</header>'
          + '</message>',

    aliasExtension: '<message from="pubsub.directories.xmpp.onsip.com" type="headline" to="jgreen!example.onsip.com@my.onsip.com" >'
                    + '<event xmlns="http://jabber.org/protocol/pubsub#event">'
                    + '<items node="/example.onsip.com/alias-extension" >'
                    + '<item id="7002" >'
                    + '<alias xmlns="onsip:xmpp:directories" publish-time="2009-11-23T23:28:22Z">'
                    + '<sip-uri>sip:7002@example.onsip.com</sip-uri>'
                    + '<xmpp-uri>xmpp:pubsub.directories.xmpp.onsip.com/?node=/example.onsip.com/user;item=mick</xmpp-uri>'
                    + '</alias>'
                    + '</item>'
                    + '</items>'
                    + '</event>'
                    + '<header name="Collection" >/me/jgreen!example.onsip.com@my.onsip.com</header>'
                    + '</message>',

    aliasPhoneNumber: '<message from="pubsub.directories.xmpp.onsip.com" type="headline" to="jgreen!example.onsip.com@my.onsip.com" >'
                      + '<event xmlns="http://jabber.org/protocol/pubsub#event">'
                      + '<items node="/example.onsip.com/alias-phone-number" >'
                      + '<item id="12132211428" >'
                      + '<alias xmlns="onsip:xmpp:directories" publish-time="2009-11-23T23:28:22Z">'
                      + '<sip-uri>sip:12132211428@jnctn.net</sip-uri>'
                      + '<xmpp-uri>xmpp:pubsub.directories.xmpp.onsip.com/?node=/example.onsip.com/time-switch;item=tfn.business.hour.rule</xmpp-uri>'
                      + '</alias>'
                      + '</item>'
                      + '</items>'
                      + '</event>'
                      + '<header name="Collection" >/me/jgreen!exampleonsip.com@my.onsip.com<./header>'
                      + '</message>'
  },

  setUp: function () {
    this.conn = OXTest.ConnectionMock.extend();
    this.ox = OX.Connection.extend({connectionAdapter: this.conn});
    this.Directories = this.ox.Directories;

    this.successFlag = false;
    this.errorFlag = false;
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

    Assert.isObject(OX.Service.Directories,
                    'Directories mixin is not available');
    Assert.isObject(this.Directories, 'Directories is not initialized');
    Assert.areSame(this.ox,           this.ox.Directories.connection);
  },

  testPubSubURI: function () {
    var Assert = YAHOO.util.Assert;

    Assert.areSame('xmpp:pubsub.directories.xmpp.onsip.com',
                   this.Directories.pubSubURI.toString(),
                   'Directories.pubSubURI is wrong.');
  },

  testItemFromElement: function() {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(this.Directories.itemFromElement,
                      'method itemFromElement does not exist on Directories.');
  },

  testUserItem: function () {
    var Assert = YAHOO.util.Assert,
      element = OXTest.DOMParser.parse(OXTest.Directories.itemXML.user);

    var item = this.Directories.itemFromElement(element.doc);

    Assert.isObject(item, 'Directories.itemFromElement did not return an object.');

    Assert.areSame('sip:hiro@example.onsip.com', item.sipURI, 'sipURI is incorrect');
    Assert.areSame('Hiro Protagonist', item.name, 'name is incorrect');
  },

  testAliasExtensionItem: function() {
    var Assert = YAHOO.util.Assert,
      element = OXTest.DOMParser.parse(OXTest.Directories.itemXML.aliasExtension);

    var item = this.Directories.itemFromElement(element.doc);
    Assert.isObject(item, 'Directories.itemFromElement did not return an object.');

    Assert.isObject(item.xmppURI, 'item xmppURI is not an object');
    Assert.areSame('sip:7002@example.onsip.com', item.sipURI, 'sipURI is incorrect');
  }
});

YAHOO.tool.TestRunner.add(OXTest.Directories);
