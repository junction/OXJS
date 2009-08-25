OXTest.Settings = new YAHOO.tool.TestCase({
  name: 'Settings Tests',

  testExists: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isObject(OX.Settings, 'OX.Settings does not exist.');
  },

  testHasActiveCallsCommandURIs: function () {
    var Assert = YAHOO.util.Assert;

    Assert.areSame('xmpp:commands.active-calls.xmpp.onsip.com?;node=create',
                   OX.Settings.URIs.command.createCall,
                   'OX.Settings.URIs.command.createCall is wrong.');
    Assert.areSame('xmpp:commands.active-calls.xmpp.onsip.com?;node=transfer',
                   OX.Settings.URIs.command.transferCall,
                   'OX.Settings.URIs.command.transferCall is wrong.');
    Assert.areSame('xmpp:commands.active-calls.xmpp.onsip.com?;node=terminate',
                   OX.Settings.URIs.command.terminateCall,
                   'OX.Settings.URIs.command.terminateCall is wrong.');
    Assert.areSame('xmpp:commands.active-calls.xmpp.onsip.com?;node=cancel',
                   OX.Settings.URIs.command.cancelCall,
                   'OX.Settings.URIs.command.cancelCall is wrong.');
  },

  testHasAuthCommandURIs: function () {
    var Assert = YAHOO.util.Assert;

    Assert.areSame('xmpp:commands.auth.xmpp.onsip.com?;node=authorize-plain',
                   OX.Settings.URIs.command.authorizePlain,
                   'OX.Settings.URIs.command.authPlain is wrong.');
  },

  testHasRecentCallsCommandURIs: function () {
    var Assert = YAHOO.util.Assert;

    Assert.areSame('xmpp:commands.recent-calls.xmpp.onsip.com?;node=label',
                   OX.Settings.URIs.command.labelCall,
                   'OX.Settings.URIs.command.labelCall is wrong.');
  },

  testHasRosterCommandURIs: function () {
    var Assert = YAHOO.util.Assert;

    Assert.areSame('xmpp:commands.rosters.xmpp.onsip.com?;node=push-roster-groups',
                   OX.Settings.URIs.command.pushRosterGroups,
                   'OX.Settings.URIs.command.pushRoster is wrong.');
  },

  testHasPubSubURIs: function () {
    var Assert = YAHOO.util.Assert;

    Assert.areSame('xmpp:pubsub.active-calls.xmpp.onsip.com',
                   OX.Settings.URIs.pubSub.activeCalls,
                   'OX.Settings.URIs.pubSub.activeCalls is wrong.');
    Assert.areSame('xmpp:pubsub.directories.xmpp.onsip.com',
                   OX.Settings.URIs.pubSub.directories,
                   'OX.Settings.URIs.pubSub.directories is wrong.');
    Assert.areSame('xmpp:pubsub.preferences.xmpp.onsip.com',
                   OX.Settings.URIs.pubSub.preferences,
                   'OX.Settings.URIs.pubSub.preferences is wrong.');
    Assert.areSame('xmpp:pubsub.recent-calls.xmpp.onsip.com',
                   OX.Settings.URIs.pubSub.recentCalls,
                   'OX.Settings.URIs.pubSub.recentCalls is wrong.');
    Assert.areSame('xmpp:pubsub.user-agents.xmpp.onsip.com',
                   OX.Settings.URIs.pubSub.userAgents,
                   'OX.Settings.URIs.pubSub.userAgents is wrong.');
    Assert.areSame('xmpp:pubsub.voicemail.xmpp.onsip.com',
                   OX.Settings.URIs.pubSub.voicemail,
                   'OX.Settings.URIs.pubSub.voicemail is wrong.');
  }
});

YAHOO.tool.TestRunner.add(OXTest.Settings);
