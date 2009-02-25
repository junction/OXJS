OXTest.ConnectionAdapter = new YAHOO.tool.TestCase({
  name: 'OX Connection Adapter Tests',

  _should: {
    ignore: {
      testAPI: true /* sample code - not a real test. */
    }
  },

  testInterface: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isNotUndefined(OX.ConnectionAdapter.send);
    Assert.isNotUndefined(OX.ConnectionAdapter.registerHandler);
    Assert.isNotUndefined(OX.ConnectionAdapter.unregisterHandler);
  },

  testAPI: function () {
    var conn = new JSJaCConnection();
    var adapter = OX.ConnectionAdapter.extend({
      registerHandler: function (event, handler) {
        return conn.registerHandler(event, handler);
      },

      unregisterHandler: function (event, handler) {
        return conn.unregisterHandler(event, handler);
      },

      send: function (xml, cb, args) {
        return conn._sendRaw(xml, cb, args);
      }
    });

    var tmp = OX.Connection.extend({connection: adapter});
  }
});

YAHOO.tool.TestRunner.add(OXTest.ConnectionAdapter);
