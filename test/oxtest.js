/* Namespace for OXJS tests. */
var OXTest = {};

OXTest.ConnectionMock = OX.Base.extend({
  _handlers: {},

  _data: null,

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