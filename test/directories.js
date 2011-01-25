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
          + '<link rel="related" type="sip" href="xmpp:pubsub.directories.xmpp.onsip.com?node=/example.onsip.com/user;item=hiro_1"/>'
          + '<link rel="related" type="sip" href="xmpp:pubsub.directories.xmpp.onsip.com?node=/example.onsip.com/user;item=hiro_2"/>'
          + '<primary/>'
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
    Assert.isFunction(item.id, 'item should have a function id.');

    Assert.areSame('sip:hiro@example.onsip.com', item.sipURI, 'sipURI is incorrect');
    Assert.areSame('Hiro Protagonist', item.name, 'name is incorrect');
  },

  testAliasExtensionItem: function() {
    var Assert = YAHOO.util.Assert,
      element = OXTest.DOMParser.parse(OXTest.Directories.itemXML.aliasExtension);

    var item = this.Directories.itemFromElement(element.doc);
    Assert.isObject(item, 'Directories.itemFromElement did not return an object.');
    Assert.isFunction(item.id, 'item should have a function id.');

    Assert.isObject(item.xmppURI, 'item xmppURI is not an object');
    Assert.areSame('sip:7002@example.onsip.com', item.sipURI, 'sipURI is incorrect');
  },

  testRelatedItems: function () {
    var Assert = YAHOO.util.Assert,
        element = OXTest.DOMParser.parse(OXTest.Directories.itemXML.user);

    var item = this.Directories.itemFromElement(element.doc);
    Assert.isObject(item, 'Directories.itemFromElement did not return an object.');
    Assert.isArray(item.related, 'item should have related SIP addresses.');

    var related = item.related;
    Assert.areSame(2, item.related.length, 'there should be 2 related SIP addresses');
    for (var i = 0; i < related.length; i++) {
      Assert.isObject(related[i], 'related items should be an object.');
    }
  },

  testIsPrimary: function () {
    var Assert = YAHOO.util.Assert,
        element = OXTest.DOMParser.parse(OXTest.Directories.itemXML.aliasExtension);

    var item = this.Directories.itemFromElement(element.doc);
    Assert.isObject(item, 'Directories.itemFromElement did not return an object.');
    Assert.isFalse(item.isPrimary, 'item should not be a primary.');

    element = OXTest.DOMParser.parse(OXTest.Directories.itemXML.user);
    item = this.Directories.itemFromElement(element.doc);
    Assert.isObject(item, 'Directories.itemFromElement did not return an object.');
    Assert.isTrue(item.isPrimary, 'item should be a primary.');
  }

});

YAHOO.tool.TestRunner.add(OXTest.Directories);
