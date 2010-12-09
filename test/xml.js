OXTest.XML = new YAHOO.tool.TestCase({
  name: 'OX.XML Tests',

  setUp: function() {
    this.demoXML = "<foo bam='baz' plip='plop'><bar><value>1</value></bar><bar><value>2</value></bar></foo>";
    this.demoDoc = OXTest.DOMParser.parse(this.demoXML);

    this.iqXML = "<iq to='testTo@sender.com' from='testFrom@receiver.com'><command xmlns='http://jabber.org/protocol/commands' action='execute' node='foo'><x xmlns='jabber:x:data' type='submit'><field var='f1'><value>f1Value</value></field><field var='f2'><value>f2Value</value></field></x></command></iq>";
    this.iqDoc = OXTest.DOMParser.parse(this.iqXML);
  },

  tearDown: function() {
    delete this.demoXML;
    delete this.demoDoc;
    delete this.iqXML;
    delete this.iqDoc;
  },

  testEscapeXML: function () {
    var Assert = YAHOO.util.Assert;
    Assert.areEqual('&lt;&gt;&quot;&apos;&amp;',
                    OX.XML.Element.escapeXML('<>"\'&'));
  },

  testEscapedCharacters: function () {
    var Assert = YAHOO.util.Assert;
    var test = OX.XML.Element.extend({name: 'test'});
    test.text = '<>"\'&';

    var doc = OXTest.DOMParser.parse(test.toString()).doc;
    Assert.areSame('<>"\'&', doc.firstChild.firstChild.nodeValue);
  },

  testXMLNamespaces: function() {
    var Assert = YAHOO.util.Assert;

    Assert.isObject(OX.XML, 'OX.XML not found');
    Assert.isObject(OX.XML.Element, 'OX.XML.Element not found');
    Assert.isObject(OX.XML.XMPP, 'OX.XML.XMPP not found');
    Assert.isObject(OX.XML.XMPP.Stanza, 'OX.XML.XMPP.Stanza not found');
    Assert.isObject(OX.XML.XMPP.IQ, 'OX.XML.XMPP.IQ not found');
    Assert.isObject(OX.XML.XMPP.Message, 'OX.XML.XMPP.Message not found');
    Assert.isObject(OX.XML.XMPP.Command, 'OX.XML.XMPP.Command not found');
    Assert.isObject(OX.XML.XMPP.XDataForm, 'OX.XML.XMPP.XDataForm not found');
  },

  testXMLAPI: function() {
    var Assert = YAHOO.util.Assert;
    Assert.isFunction(OX.XML.Element.addChild, 'addChild is not a function');
    Assert.isFunction(OX.XML.Element.attr, 'attr is not a function');
    Assert.isFunction(OX.XML.Element.toString, 'toString is not a function');
    Assert.isFunction(OX.XML.Element.create, 'create is not a function');
  },

  testXMLElement: function() {
    var Assert = YAHOO.util.Assert;

    var typeOfElement = OX.XML.Element.extend({name: 'test'});

    var extendedElement = typeOfElement.extend();
    extendedElement.attr('bam', 'bop');
    Assert.areEqual('bop', extendedElement.attr('bam'));
    Assert.isUndefined(extendedElement.attr('bop'));

    //
    // test OX.XML.Element.create
    //
    var createdAttrs = {foo: 'bar', baz: 'bam'};
    var createdChild = OX.XML.Element.extend({name: 'child', text: 'the text'});
    var createdElement = typeOfElement.create(createdAttrs, [createdChild]);

    Assert.areEqual('bar', createdElement.attr('foo'));
    Assert.areEqual('test', createdElement.name);

    var doc = OXTest.DOMParser.parse(createdElement.toString());
    Assert.areEqual('the text', doc.getPathValue('/test/child/text()'));

    var createdElement2 = typeOfElement.create(createdAttrs, createdChild);
    Assert.areEqual(createdElement.toString(), createdElement2.toString());
  },

  testDemoXMLStructure: function() {
    var Assert = YAHOO.util.Assert;
    var
      foo = OX.XML.Element.extend({name:'foo'}),
      bar = OX.XML.Element.extend({name:'bar'}),
      bar2 = OX.XML.Element.extend({name:'bar'}),
      value = OX.XML.Element.extend({name:'value',text: 1});
      value2 = OX.XML.Element.extend({name:'value',text: 2});

    foo.addChild(bar);
    foo.addChild(bar2);
    bar.addChild(value);
    bar2.addChild(value2);
    foo.attr('bam','baz');
    foo.attr('plip','plop');

    //
    // test attr() and text
    //
    Assert.areEqual('baz', foo.attr('bam'));
    Assert.areEqual(this.demoDoc.getPathValue('/foo/@bam'), foo.attr('bam'));
    Assert.areEqual(this.demoDoc.getPathValue('/foo/@plip'), foo.attr('plip'));
    Assert.areEqual(this.demoDoc.getPathValue('/foo/bar[1]/value/text()'), value.text);
    Assert.areEqual(this.demoDoc.getPathValue('/foo/bar[2]/value/text()'), value2.text);
  },

  testIQStructure: function() {
    var Assert = YAHOO.util.Assert;
    var
      iq = OX.XML.XMPP.IQ.extend();
      body = OX.XML.Element.extend({name: 'garbage', text: 'text'});

    iq.to('testTo@sender.com');
    iq.from('testFrom@receiver.com');
    iq.addChild(body);

    Assert.isFunction(iq.to);
    Assert.isFunction(iq.from);

    //
    // test values
    //
    Assert.areEqual('testTo@sender.com', iq.attr('to'), 'str not equal to iq.attr("to")');
    Assert.areEqual('testFrom@receiver.com', iq.attr('from'), 'str not equal to iq.attr("from")');

    //
    // test attr aliases
    //
    Assert.areEqual(iq.attr('to'), iq.to(), 'iq.attr(to) != iq.to()');
    Assert.areEqual(iq.attr('from'), iq.from(), 'iq.attr(from) != iq.from()');

    //
    // test DOM structure xpath
    //
    var doc = OXTest.DOMParser.parse(iq.toString());
    Assert.areEqual(iq.to(),
                    doc.getPathValue('/iq/@to'),
                    "xpath not equal to iq.to()");
    Assert.areEqual(iq.from(),
                    doc.getPathValue('/iq/@from'),
                    "xpath not equal to iq.from()");
  },

  testPubSubStructure: function() {
    var Assert = YAHOO.util.Assert;
    var p = OX.XML.XMPP.PubSub.extend();

    Assert.areEqual("pubsub", p.name, 'pubsub element name is incorrect');
    Assert.areEqual("http://jabber.org/protocol/pubsub", p.xmlns, 'pubsub namespace is incorrect');
  },

  testCommandAPI: function() {
    var Assert = YAHOO.util.Assert;
    Assert.isFunction(OX.XML.XMPP.Command.node);
    Assert.isFunction(OX.XML.XMPP.Command.action);
  },

  testCommandStructure: function() {
    var Assert = YAHOO.util.Assert;
    var iq = OX.XML.XMPP.IQ.extend(),
      cmd = OX.XML.XMPP.Command.extend();

    iq.addChild(cmd);
    cmd.node("foo");
    cmd.action("execute");

    //
    // test xmlns
    //
    Assert.areEqual("http://jabber.org/protocol/commands", cmd.xmlns, 'command namespace incorrect');

    //
    // test attr aliases
    //
    Assert.areEqual("foo", cmd.node(), "string:foo not equal to cmd.node()");
    Assert.areEqual("execute", cmd.action(), "string:execute not equal to cmd.action()");

    //
    // test DOM structure xpath
    //
    var doc = OXTest.DOMParser.parse(iq.toString());
    Assert.areEqual(cmd.node(),
                    doc.getPathValue('/iq/cmd:command/@node'),
                    "xpath not equal to cmd.node()");
    Assert.areEqual(cmd.action(),
                    doc.getPathValue('/iq/cmd:command/@action'),
                    "xpath not equal to cmd.action()");
  },

  testXDataFormAPI: function() {
    var Assert = YAHOO.util.Assert;
    Assert.isFunction(OX.XML.XMPP.XDataForm.type, 'type is not a function');
    Assert.isFunction(OX.XML.XMPP.XDataForm.addField, 'addField is not a function');
  },

  testXDataFormStructure: function() {
    var Assert = YAHOO.util.Assert;
    var iq = OX.XML.XMPP.IQ.extend(),
      cmd = OX.XML.XMPP.Command.extend(),
      x = OX.XML.XMPP.XDataForm.extend();

    iq.addChild(cmd);
    cmd.node("foo");
    cmd.action("execute");
    cmd.addChild(x);

    x.type('submit');
    x.addField('f1','f1Value');
    x.addField('f2','f2Value');

    //
    // test xmlns
    //
    Assert.areEqual("jabber:x:data", x.xmlns, 'x namesapce incorrect');

    //
    // test attr aliases
    //
    Assert.areEqual("submit", x.type(), "string:submit not equal to x.type()");

    //
    // test DOM structure xpath
    //
    var doc = OXTest.DOMParser.parse(iq.toString());
    Assert.areEqual(x.type(),
                    doc.getPathValue('/iq/cmd:command/x:x/@type'),
                    "xpath not equal to x.type()");
    Assert.areEqual('f1Value',
                    doc.getPathValue('/iq/cmd:command/x:x/x:field[@var="f1"]/x:value/text()'));
    Assert.areEqual('f2Value',
                    doc.getPathValue('/iq/cmd:command/x:x/x:field[@var="f2"]/x:value/text()'));

  }
});

YAHOO.tool.TestRunner.add(OXTest.XML);
