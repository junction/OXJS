OXTest.URI = new YAHOO.tool.TestCase({
  name: 'OX URI Tests',

  testParse: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(OX.URI.parse, 'URI.parse is not a function.');
  },

  testToString: function () {
    var Assert = YAHOO.util.Assert;

    var uriString = 'xmpp://some@jid.com/test@foobar.com?message;subject=test;body=foobar';
    var uri = OX.URI.parse(uriString);
    Assert.isFunction(uri.toString, 'uri.toString is not a function.');
    Assert.areSame(uriString, uri.toString(),
                   'Unparse of parse did not produce the same string used to parse.');
  },

  testFromObject: function () {
    var Assert = YAHOO.util.Assert;

    var uri = OX.URI.Base.extend({to:      'foo@bar.com',
                                  command: 'message'});
    Assert.areSame('xmpp:foo@bar.com?message', uri.toString());
  },

  testParse: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(OX.URI.parse, 'URI.parse is not a function.');
  }
});

YAHOO.tool.TestRunner.add(OXTest.URI);
