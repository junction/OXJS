OXTest.URI = new YAHOO.tool.TestCase({
  name: 'OX URI Tests',

  testParse: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(OX.URI.parse);
  },

  testToString: function () {
    var Assert = YAHOO.util.Assert;

    var uri = OX.URI.parse('xmpp://some@jid.com/test@foobar.com?message;subject=test;body=foobar');
    Assert.isFunction(uri.toString);
  },

  testFromObject: function () {
    var Assert = YAHOO.util.Assert;

    var uri = OX.URI.extend({to:      'foo@bar.com',
                             command: 'message'});
    Assert.isObject(uri);
    Assert.areSame('xmpp:foo@bar.com?message', uri.toString());
  },

  testParse: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(OX.URI.parse);
  }
});

YAHOO.tool.TestRunner.add(OXTest.URI);
