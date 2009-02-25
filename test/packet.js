OXTest.Packet = new YAHOO.tool.TestCase({
  name: 'OX Packet Test',

  testPacket: function() {
    var Assert = YAHOO.util.Assert;

    Assert.isObject(OX.Packet);
    Assert.isFunction(OX.Packet.getID);
    Assert.isFunction(OX.Packet.setID);
    Assert.isFunction(OX.Packet.xml);
    Assert.isFunction(OX.Packet.pType);
  }
});

YAHOO.tool.TestRunner.add(OXTest.Packet);
