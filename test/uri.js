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
    Assert.areSame(uriString, uri.convertToString(),
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
    Assert.areSame(uriString, uri.convertToString(),
                   'Unparse of parse did not produce the same string used to parse.');
  },

  testPathQuery: function () {
    var Assert = YAHOO.util.Assert;

    var uriString = 'xmpp:enoch@example.com?query';
    var uri = OX.URI.parse(uriString);
    Assert.areSame('xmpp', uri.scheme);
    Assert.areSame('enoch@example.com', uri.path);
    Assert.areSame('query', uri.query);
    Assert.isUndefined(uri.authority);
    Assert.isUndefined(uri.fragment);
    Assert.areSame(uriString, uri.convertToString(),
                   'Unparse of parse did not produce the same string used to parse.');
  },

  testPathQueryFrag: function () {
    var Assert = YAHOO.util.Assert;

    var uriString = 'xmpp:enoch@example.com?query#frag';
    var uri = OX.URI.parse(uriString);
    Assert.areSame('xmpp', uri.scheme);
    Assert.areSame('enoch@example.com', uri.path);
    Assert.areSame('query', uri.query);
    Assert.areSame('frag', uri.fragment);
    Assert.isUndefined(uri.authority);
    Assert.areSame(uriString, uri.convertToString(),
                   'Unparse of parse did not produce the same string used to parse.');
  },

  testAuthorityPath: function () {
    var Assert = YAHOO.util.Assert;

    var uriString = 'xmpp://jill@example.com/enoch@example.com';
    var uri = OX.URI.parse(uriString);
    Assert.areSame('xmpp', uri.scheme);
    Assert.areSame('jill@example.com', uri.authority);
    Assert.areSame('enoch@example.com', uri.path);
    Assert.isUndefined(uri.query);
    Assert.isUndefined(uri.fragment);
    Assert.areSame(uriString, uri.convertToString(),
                   'Unparse of parse did not produce the same string used to parse.');
  },

  testAuthorityPathQuery: function () {
    var Assert = YAHOO.util.Assert;

    var uriString = 'xmpp://jill@example.com/enoch@example.com?message';
    var uri = OX.URI.parse(uriString);
    Assert.areSame('xmpp', uri.scheme);
    Assert.areSame('jill@example.com', uri.authority);
    Assert.areSame('enoch@example.com', uri.path);
    Assert.areSame('message', uri.query);
    Assert.isUndefined(uri.fragment);
    Assert.areSame(uriString, uri.convertToString(),
                   'Unparse of parse did not produce the same string used to parse.');
  },

  testFromSimpleObject: function () {
    var Assert = YAHOO.util.Assert;

    var uri = OX.URI.fromObject({path: 'foo@bar.com'});
    Assert.areSame('xmpp:foo@bar.com', uri.convertToString());
  },

  testFromFullObject: function () {
    var Assert = YAHOO.util.Assert;

    var uri = OX.URI.fromObject({scheme:    'xmpp',
                                 authority: 'enoch@example.com',
                                 path:      'foo@bar.com',
                                 query:     'message;subject=Hi',
                                 fragment:  'baz'});
     Assert.areSame('xmpp://enoch@example.com/foo@bar.com?message;subject=Hi#baz',
                   uri.convertToString());
  },

  testActionParse: function () {
    var Assert = YAHOO.util.Assert;

    var uri = OX.URI.fromObject({query: 'message;subject=Hi'});
    Assert.isFunction(uri.action,
                      'URI action accessor is not a function.');
    Assert.areSame('message', uri.action(),
                   'URI action is wrong.');
  },

  testActionEmptyParse: function () {
    var Assert = YAHOO.util.Assert;

    var uri = OX.URI.fromObject({query: ';subject=Hi'});
    Assert.isUndefined(uri.action(), 'URI action is wrong.');
  },

  testParamParse: function () {
    var Assert = YAHOO.util.Assert;

    var uri = OX.URI.fromObject({query: ';subject=Hi'});
    Assert.isFunction(uri.queryParam,
                      'URI query parameter accessor is not a function.');
    Assert.areSame('Hi', uri.queryParam('subject'),
                   'URI subject parameter is wrong.');
  },

  testParamEmptyParse: function () {
    var Assert = YAHOO.util.Assert;

    var uri = OX.URI.fromObject({query: 'message'});
    Assert.isUndefined(uri.queryParam('subject'),
                       'URI subject parameter is wrong.');
  },

  testParamNoValueParse: function () {
    var Assert = YAHOO.util.Assert;

    var uri = OX.URI.fromObject({query: ';foo'});
    Assert.areSame('', uri.queryParam('foo'),
                   'URI empty parameter is wrong.');
  }
});

YAHOO.tool.TestRunner.add(OXTest.URI);
