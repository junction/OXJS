OXTest.URI = new YAHOO.tool.TestCase({
  name: 'OX URI Tests',

  testParseFull: function () {
    var Assert = YAHOO.util.Assert;

    var uriString = 'xmpp://some@jid.com/test@foobar.com?message;subject=test;body=foobar#frag';
    var uri = OX.URI.parse(uriString);
    Assert.areSame('xmpp', uri.scheme);
    Assert.areSame('some@jid.com', uri.authority);
    Assert.areSame('test@foobar.com', uri.path);
    Assert.areSame('message;subject=test;body=foobar', uri.query);
    Assert.areSame('frag', uri.fragment);
    Assert.areSame(uriString, uri.toString(),
                   'Unparse of parse did not produce the same string used to parse.');
  },

  testParseSimple: function () {
    var Assert = YAHOO.util.Assert;

    var uriString = 'xmpp:enoch@example.com';
    var uri = OX.URI.parse(uriString);
    Assert.areSame('xmpp', uri.scheme);
    Assert.areSame('enoch@example.com', uri.path);
    Assert.isUndefined(uri.authority);
    Assert.isUndefined(uri.query);
    Assert.isUndefined(uri.fragment);
    Assert.areSame(uriString, uri.toString(),
                   'Unparse of parse did not produce the same string used to parse.');
  },

  testFromSimpleObject: function () {
    var Assert = YAHOO.util.Assert;

    var uri = OX.URI.fromObject({path: 'foo@bar.com'});
    Assert.areSame('xmpp:foo@bar.com', uri.toString());
  },

  testFromFullObject: function () {
    var Assert = YAHOO.util.Assert;

    var uri = OX.URI.fromObject({scheme:    'xmpp',
                                 authority: 'enoch@example.com',
                                 path:      'foo@bar.com',
                                 query:     'message;subject=Hi',
                                 fragment:  'baz'});
    Assert.areSame('xmpp://enoch@example.com/foo@bar.com?message;subject=Hi#baz',
                   uri.toString());
  }
});

YAHOO.tool.TestRunner.add(OXTest.URI);
