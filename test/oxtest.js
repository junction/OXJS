/* Namespace for OXJS tests. */
var OXTest = {};

OXTest.ConnectionMock = OX.Base.extend({
  _handlers: {},

  _data: null,

  fireEvent: function (event) {
    var handler = this._handlers[event],
        args    = arguments.slice(1);

    handler.apply(handler, args);
  },

  send: function (xml, callback, args) {
    this._data = xml;
    callback.apply(callback, args);
  },

  registerHandler: function (event, handler) {
    this._handlers[event] = handler;
  },

  unregisterHandler: function (event, handler) {
    delete this._handlers[event];
  }
});

OXTest.DOMParser = OX.Base.extend({
  parser: new DOMParser(),

  prefixMap: {
    cmd: 'http://jabber.org/protocol/commands',
    x: 'jabber:x:data',
    ps: 'http://jabber.org/protocol/pubsub'
  },

  nsResolver: function (ns) {
    return OXTest.DOMParser.prefixMap[ns];
  },

  parse: function (xml) {
    return OX.Base.extend({
      doc: OXTest.DOMParser.parser.parseFromString(xml, 'text/xml'),

      getPath: function (path) {
        return this.doc.evaluate(path, this.doc, OXTest.DOMParser.nsResolver,
                                 XPathResult.ANY_TYPE, null).iterateNext();
      },

      getPathValue: function (path) {
        var rc = this.getPath(path);
        if (rc) {
          if (rc.data) {
            return rc.data;
          } else if (rc.value) {
            return rc.value;
          } else {
            return rc;
          }
        } else {
          return undefined;
        }
      }
    });
  }
});

YAHOO.util.Assert.isCommand = function (xml, jid, node, fields) {
  var doc = OXTest.DOMParser.parse(xml);

  this.areSame('set',
               doc.getPathValue('/iq/@type'),
               'command iq is not type set.');
  this.areSame(jid,
               doc.getPathValue('/iq/@to'),
               'command iq is sent to wrong jid.');
  this.areSame(node,
               doc.getPathValue('/iq/cmd:command/@node'),
               'command node is wrong.');
  this.areSame('submit',
               doc.getPathValue('/iq/cmd:command/x:x/@type'),
               'command xform type is wrong.');

  for (var f in fields) if (fields.hasOwnProperty(f)) {
    var path = '/iq/cmd:command/x:x/x:field[@var="' + f + '"]/x:value/text()';

    this.areSame(fields[f], doc.getPathValue(path),
                   'field value for ' + f + 'is wrong.');
  }
};

YAHOO.util.Assert.isSubscribe = function (xml, jid, node, ourJID) {
  var doc = OXTest.DOMParser.parse(xml);

  this.areSame('set',
               doc.getPathValue('/iq/@type'),
               'subscribe iq is not type set.');
  this.areSame(jid,
               doc.getPathValue('/iq/@to'),
               'subscribe iq is sent to wrong jid.');
  this.areSame(node,
               doc.getPathValue('/iq/ps:pubsub/ps:subscribe/@node'),
               'subscribe node is wrong');
  this.areSame(ourJID,
               doc.getPathValue('/iq/ps:pubsub/ps:subscribe/@jid'),
               'subscribe jid is wrong');
};

YAHOO.util.Assert.isUnsubscribe = function (xml, jid, node, ourJID) {
  var doc = OXTest.DOMParser.parse(xml);

  this.areSame('set',
               doc.getPathValue('/iq/@type'),
               'unsubscribe iq is not type set.');
  this.areSame(jid,
               doc.getPathValue('/iq/@to'),
               'unsubscribe iq is sent to wrong jid.');
  this.areSame(node,
               doc.getPathValue('/iq/ps:pubsub/ps:unsubscribe/@node'),
               'unsubscribe node is wrong');
  this.areSame(ourJID,
               doc.getPathValue('/iq/ps:pubsub/ps:unsubscribe/@jid'),
               'unsubscribe jid is wrong');
};

YAHOO.util.Assert.isGetItems = function (xml, jid, node) {
  var doc = OXTest.DOMParser.parse(xml);

  this.areSame('set',
               doc.getPathValue('/iq/@type'),
               'unsubscribe iq is not type set.');
  this.areSame(jid,
               doc.getPathValue('/iq/@to'),
               'unsubscribe iq is sent to wrong jid.');
  this.areSame(node,
               doc.getPathValue('/iq/ps:pubsub/ps:items/@node'),
               'unsubscribe node is wrong');
};
