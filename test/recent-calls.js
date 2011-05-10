OXTest.RecentCalls = new YAHOO.tool.TestCase({
  name: 'RecentCalls Tests',

  cancelledCall: '<recent-call xmlns="onsip:recent-calls">\
                    <to-uri>sip:bob@incredibl.es</to-uri>\
                    <to-display>&quot;Bob Parr&quot;</to-display>\
                    <time start="2011-05-10T14:18:51Z"\
                          duration="0"/>\
                  </recent-call>',

  missedCall: '<recent-call xmlns="onsip:recent-calls">\
                 <from-uri>sip:helen@incredibl.es</from-uri>\
                 <from-display>&quot;Helen Parr&quot;</from-display>\
                 <time start="2011-05-10T14:18:51Z"\
                       duration="0"/>\
               </recent-call>',

  recentCall: '<recent-call xmlns="onsip:recent-calls">\
                 <to-uri>sip:edna@mo.de</to-uri>\
                 <to-display>&quot;Edna Mode&quot;</to-display>\
                 <time start="2011-05-12T18:22:07Z"\
                       duration="600"/>\
               </recent-call>',

  setUp: function () {
    this.conn = OXTest.ConnectionMock.extend();
    this.ox = OX.Connection.extend({connectionAdapter: this.conn});
    this.RecentCalls = this.ox.RecentCalls;
  },

  tearDown: function () {
    delete this.conn;
    delete this.ox;
    delete this.RecentCalls;
  },

  testServiceMixin: function () {
    var assert = YAHOO.util.Assert;

    assert.isObject(OX.Service.RecentCalls,
                    'RecentCalls mixin is not available');
    assert.isObject(this.ox.RecentCalls, 'RecentCalls is not initialized');
    assert.areSame(this.ox, this.ox.RecentCalls.connection);
  },

  testPubSubURI: function () {
    var assert = YAHOO.util.Assert;

    assert.areSame('xmpp:pubsub.recent-calls.xmpp.onsip.com',
                   this.RecentCalls.pubSubURI.toString(),
                   'RecentCalls.pubSub URI is wrong.');
  },

  testItemFromElement: function () {
    var assert = YAHOO.util.Assert;

    assert.isFunction(this.RecentCalls.itemFromElement,
                      'Recent call service cannot turn packet into item.');

    var packet = OXTest.DOMParser.parse(this.recentCall);
    var item = this.RecentCalls.itemFromElement(packet.doc);
    assert.isObject(item, 'RecentCalls.itemFromElement did not return an object.');
    assert.areSame(this.ox, item.connection,
                   'Recent call item connection is wrong.');
  },

  testRecentCall: function () {
    var assert = YAHOO.util.Assert;

    var packet = OXTest.DOMParser.parse(this.recentCall);
    var item = this.RecentCalls.itemFromElement(packet.doc);

    assert.areEqual(item.toURI, "sip:edna@mo.de", "the call's toURIs should match.");
    assert.areEqual(item.toDisplay, "\"Edna Mode\"", "the call's toDisplays should match.");
    assert.areEqual(item.startTime.getTime(), 1305224527000, "the call's startTime should be a date.");
    assert.areEqual(item.duration, 600, "the call's duration should be 600 seconds");
    assert.isFalse(item.isIncoming(), "the call should not be incoming");
    assert.isTrue(item.isOutgoing(), "the call should be outgoing");
    assert.isFalse(item.isCancelled(), "the call should not be cancelled");
    assert.isFalse(item.isMissed(), "the call should not be missed");
  },

  testMissedCall: function () {
    var assert = YAHOO.util.Assert;

    var packet = OXTest.DOMParser.parse(this.missedCall);
    var item = this.RecentCalls.itemFromElement(packet.doc);

    assert.areEqual(item.fromURI, "sip:helen@incredibl.es", "the call's fromURIs should match.");
    assert.areEqual(item.fromDisplay, "\"Helen Parr\"", "the call's fromDisplays should match.");
    assert.areEqual(item.startTime.getTime(), 1305037131000, "the call's startTime should be a date.");
    assert.areEqual(item.duration, 0, "the call's duration should be 0 seconds");
    assert.isTrue(item.isIncoming(), "the call should be incoming");
    assert.isFalse(item.isOutgoing(), "the call should not be outgoing");
    assert.isFalse(item.isCancelled(), "the call should not be cancelled");
    assert.isTrue(item.isMissed(), "the call should be missed");
  },

  testCancelledCall: function () {
    var assert = YAHOO.util.Assert;

    var packet = OXTest.DOMParser.parse(this.cancelledCall);
    var item = this.RecentCalls.itemFromElement(packet.doc);

    assert.areEqual(item.toURI, "sip:bob@incredibl.es", "the call's toURIs should match.");
    assert.areEqual(item.toDisplay, "\"Bob Parr\"", "the call's toDisplays should match.");
    assert.areEqual(item.startTime.getTime(), 1305037131000, "the call's startTime should be a date.");
    assert.areEqual(item.duration, 0, "the call's duration should be 0 seconds");
    assert.isFalse(item.isIncoming(), "the call should be incoming");
    assert.isTrue(item.isOutgoing(), "the call should not be outgoing");
    assert.isTrue(item.isCancelled(), "the call should be cancelled");
    assert.isFalse(item.isMissed(), "the call should not be missed");
  }

});

YAHOO.tool.TestRunner.add(OXTest.RecentCalls);
