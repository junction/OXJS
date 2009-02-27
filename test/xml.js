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

  testXMLNamespaces: function() {
    var Assert = YAHOO.util.Assert;

    Assert.isObject(OX.XML, 'OX.XML not found');
    Assert.isObject(OX.XML.Element, 'OX.XML.Element not found');

    Assert.isObject(OX.XMPP, 'OX.XMPP not found');
    Assert.isObject(OX.XMPP.Stanza, 'OX.XMPP.Stanza not found');
    Assert.isObject(OX.XMPP.IQ, 'OX.XMPP.IQ not found');
    Assert.isObject(OX.XMPP.Message, 'OX.XMPP.Message not found');
    Assert.isObject(OX.XMPP.Command, 'OX.XMPP.Command not found');
    Assert.isObject(OX.XMPP.XDataForm, 'OX.XMPP.XDataForm not found');
  },

  testXMLAPI: function() {
    var Assert = YAHOO.util.Assert;
    Assert.isFunction(OX.XML.Element.addChild, 'addChild is not a function');
    Assert.isFunction(OX.XML.Element.attr, 'attr is not a function');
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

    Assert.areEqual('baz', foo.attr('bam'));
    Assert.areEqual(this.demoDoc.getPathValue('/foo/@bam'), foo.attr('bam'));
    Assert.areEqual(this.demoDoc.getPathValue('/foo/@plip'), foo.attr('plip'));
    Assert.areEqual(this.demoDoc.getPathValue('/foo/bar[1]/value/text()'), value.text);
    Assert.areEqual(this.demoDoc.getPathValue('/foo/bar[2]/value/text()'), value2.text);
  },

  testIQStructure: function() {
    var Assert = YAHOO.util.Assert;
    var
      iq = OX.XMPP.IQ.extend();
      body = OX.XML.Element.extend({name: 'garbage', text: 'text'});

    iq.to('testTo@sender.com');
    iq.from('testFrom@receiver.com');
    iq.addChild(body);

    Assert.isFunction(iq.to);
    Assert.isFunction(iq.from);

    Assert.areEqual('testTo@sender.com', iq.attr('to'), 'str not equal to iq.attr("to")');
    Assert.areEqual('testFrom@receiver.com', iq.attr('from'), 'str not equal to iq.attr("from")');
    Assert.areEqual(iq.attr('to'), iq.to(), 'iq.attr(to) != iq.to()');
    Assert.areEqual(iq.attr('from'), iq.from(), 'iq.attr(from) != iq.from()');
    Assert.areEqual(this.iqDoc.getPathValue('/iq/@to'), iq.to(), 'xpath != iq.to()');
    Assert.areEqual(this.iqDoc.getPathValue('/iq/@from'), iq.from(), 'xpath != iq.from()');
  },

  testCommandAPI: function() {
    var Assert = YAHOO.util.Assert;
    Assert.isFunction(OX.XMPP.Command.node);
    Assert.isFunction(OX.XMPP.Command.action);
  },

  testCommandStructure: function() {
    var Assert = YAHOO.util.Assert;
    var iq = OX.XMPP.IQ.extend(),
      cmd = OX.XMPP.Command.extend();

    iq.addChild(cmd);
    cmd.node("foo");
    cmd.action("execute");

    Assert.areEqual("http://jabber.org/protocol/commands", cmd.ns, 'command namespace incorrect');

    Assert.areEqual("foo", cmd.node(), "string:foo not equal to cmd.node()");
    Assert.areEqual("execute", cmd.action(), "string:execute not equal to cmd.action()");
    Assert.areEqual(this.iqDoc.getPathValue('/iq/cmd:command/@node'), cmd.node(), "xpath not equal to cmd.node()");
    Assert.areEqual(this.iqDoc.getPathValue('/iq/cmd:command/@action'), cmd.action(), "xpath not equal to cmd.node()");
  },

  testXDataFormAPI: function() {
    var Assert = YAHOO.util.Assert;
    Assert.isFunction(OX.XMPP.XDataForm.type, 'type is not a function');
    Assert.isFunction(OX.XMPP.XDataForm.addField, 'addField is not a function');
  },

  testXDataFormStructure: function() {
    var Assert = YAHOO.util.Assert;
    var iq = OX.XMPP.IQ.extend(),
      cmd = OX.XMPP.Command.extend(),
      x = OX.XMPP.XDataForm.extend();

    iq.addChild(cmd);
    cmd.node("foo");
    cmd.action("execute");
    cmd.addChild(x);

    x.type('submit');
    x.addField('f1','f1Value');
    x.addField('f2','f2Value');

    Assert.areEqual("jabber:x:data", x.ns, 'x namesapce incorrect');

    Assert.areEqual(this.iqDoc.getPathValue('/iq/cmd:command/x:x/x:field[@var="f1"]/x:value/text()'),x.addField('f1'));
    Assert.areEqual(this.iqDoc.getPathValue('/iq/cmd:command/x:x/x:field[@var="f2"]/x:value/text()'),x.addField('f2'));
  }
});

YAHOO.tool.TestRunner.add(OXTest.XML);
