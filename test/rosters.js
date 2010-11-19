OXTest.Rosters = new YAHOO.tool.TestCase({
  name: 'Rosters Tests',

  setUp: function () {
    this.conn = OXTest.ConnectionMock.extend();
    this.ox = OX.Connection.extend({connectionAdapter: this.conn});
    this.Rosters = this.ox.Rosters;
  },

  tearDown: function () {
    delete this.conn;
    delete this.ox;
    delete this.Rosters;
  },

  testServiceMixin: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isObject(OX.Service.Rosters,
                    'Rosters mixin is not available');
    Assert.isObject(this.Rosters, 'Rosters mixin is not initialized');
    Assert.areSame(this.ox, this.ox.Rosters.connection);
  },

  testPushRosterGroups: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(this.Rosters.pushRosterGroups,
                      'Push roster groups functionality not available.');
  },

  testPushRosterGroupsWithJID: function () {
    var Assert = YAHOO.util.Assert;

    this.Rosters.pushRosterGroups(null, { jid: 'enoch@jid-example.com' });

    Assert.isCommand(this.conn._data, 'commands.rosters.xmpp.onsip.com',
                     'push-roster-groups',
                     {'jid':         'enoch@jid-example.com'});
  },

  testPushRosterGroupsSuccess: function () {
    var Assert = YAHOO.util.Assert;

    this.conn.addResponse(OXTest.Packet.extendWithXML('<iq from="commands.rosters.xmpp.onsip.com" type="result" to="foo!example.onsip.com@dashboard.onsip.com/theresource" id="test" ><command xmlns="http://jabber.org/protocol/commands" status="completed"  node="push-roster-groups" sessionid="9a69e10043633f67a45ae63d1a1e504f" /></iq>'));

    var successFlag = false, errorFlag = false;
    this.Rosters.pushRosterGroups({
      onSuccess: function () { successFlag = true; },
      onError:   function () { errorFlag   = true; }
    });

    Assert.isFalse(errorFlag, 'Got error trying to push roster groups.');
    Assert.isTrue(successFlag, 'Was not successful trying to push roster groups.');
  },

  testPushRosterGroupsError: function () {
    var Assert = YAHOO.util.Assert;

    this.conn.addResponse(OXTest.Packet.extendWithXML('<iq from="commands.rosters.xmpp.onsip.com" type="error" xml:lang="en" to="foo!example.onsip.com@dashboard.onsip.com/theresource" id="test"><command xmlns="http://jabber.org/protocol/commands" node="push-roster-groups" sessionid="session-id"><x xmlns="jabber:x:data" type="submit"><field type="hidden" var="jid" /></x></command><error type="cancel" code="400"><bad-request xmlns="urn:ietf:params:xml:ns:xmpp-stanzas"/><text xmlns="urn:ietf:params:xml:ns:xmpp-stanzas">The requesting JID is not allowed to execute the command.</text><bad-action xmlns="http://jabber.org/protocol/commands"/></error></iq>'));

    var successFlag = false, errorFlag = false;
    this.Rosters.pushRosterGroups({
      onSuccess: function () { successFlag = true; },
      onError:   function () { errorFlag   = true; }
    });

    Assert.isFalse(successFlag, 'Was successful trying to push roster groups.');
    Assert.isTrue(errorFlag, 'Did not get error trying to push roster groups.');
  }

});

YAHOO.tool.TestRunner.add(OXTest.Rosters);
