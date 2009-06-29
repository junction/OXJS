/* Namespace for OXJS tests. */
var OXTest = {};

OXTest.ConnectionMock = OX.ConnectionAdapter.extend({
  _handlers: {},

  _data: null,

  _responses: [],

  jid: function () { return 'mock@example.com'; },

  init: function () {
    this._responses = [];
    this._handlers  = {};

    return this;
  },

  addResponse: function (response) {
    this._responses.push(response);
  },

  nextResponse: function () {
    return this._responses.shift();
  },

  fireEvent: function (event) {
    var handler = this._handlers[event],
        args    = [];

    for (var i = 1; i < arguments.length; i++) {
      args.push(arguments[i]);
    }
    handler.apply(handler, args);
  },

  send: function (xml, callback, args) {
    this._data = xml;
    args = args || [];
    args.unshift(this.nextResponse());
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
  parser: function () {
    var parser;
    try
    {
      // Internet Explorer does not use the DOMParser
      parser = new ActiveXObject("Microsoft.XMLDOM");
      parser.async = "false";
      parser.setProperty("SelectionLanguage","XPath");
      parser.setProperty("SelectionNamespaces",
                         "xmlns:cmd='http://jabber.org/protocol/commands' xmlns:x='jabber:x:data' xmlns:ps='http://jabber.org/protocol/pubsub'");
    }
    catch(e)
    {
      // Using FF or Safari
      parser = new DOMParser();
    }
    return parser;
  },

  prefixMap: {
    cmd: 'http://jabber.org/protocol/commands',
    x:   'jabber:x:data',
    ps:  'http://jabber.org/protocol/pubsub'
  },

  nsResolver: function (ns) {
    return OXTest.DOMParser.prefixMap[ns];
  },

  parse: function (xml) {
    var doc,
        parser = OXTest.DOMParser.parser();
    try
    {
      // IE
      parser.loadXML(xml);
      doc = parser;
    }
    catch(e)
    {
      // Firefox and Safari
      doc = parser.parseFromString(xml, 'text/xml');
    }

    return OX.Base.extend({
      doc: doc,

      getPath: function (path) {
        var result;
        try {
          // Using Internet Explorer
          result = parser.selectSingleNode(path);
        }
        catch(e)
        {
          // Using FF or Safari
          result = this.doc.evaluate(path, this.doc, OXTest.DOMParser.nsResolver,
                                     XPathResult.ANY_TYPE, null).iterateNext();
        }
        return result;
      },

      getPathValue: function (path) {
        var rc = this.getPath(path);

        if (rc) {
          if (window.ActiveXObject) {
            // Internet Explorer
            return rc.nodeValue;
          } else {
            // FF or Safari
            if (rc.data) {
              return rc.data;
            } else if (rc.value) {
              return rc.value;
            } else {
              return rc;
            }
          }
        } else {
          return undefined;
        }
      }
    });
  }
});

OXTest.Packet = OX.Base.extend({
  from:    null,
  to:      null,
  type:    null,
  doc:     null,
  parser:  null,

  extendWithXML: function (xml) {
    var parser_obj = OXTest.DOMParser.parse(xml);

    var from = parser_obj.getPathValue('//@from'),
        to   = parser_obj.getPathValue('//@to'),
        type = parser_obj.getPathValue('//@type');

    return OXTest.Packet.extend({from: from, to: to, type: type, doc: parser_obj.doc});
  },

  getFrom: function () {
    return this.from;
  },

  getTo: function () {
    return this.to;
  },

  getType: function () {
    return this.type;
  },

  getNode: function () {
    return this.doc.firstChild;
  }
});

OXTest.Message = OXTest.Packet.extend({
  pType: 'message'
});

OXTest.IQ = OXTest.Packet.extend({
  pType: 'iq'
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
                   'field value for ' + f + ' is wrong.');
  }
};

YAHOO.util.Assert.isConfigure = function (xml, to, node, subscriberJID, subid, options) {
  var doc = OXTest.DOMParser.parse(xml);

  this.areSame('set', doc.getPathValue('/iq/@type'), 'configure iq type is not set');
  this.areSame(to, doc.getPathValue('/iq/@to'), 'configure iq to is incorrect');

  this.areSame(node, doc.getPathValue('/iq/ps:pubsub/ps:options/@node'), 'node is incorrect');
  this.areSame(subscriberJID, doc.getPathValue('/iq/ps:pubsub/ps:options/@jid'), 'subscriber jid is incorrect');

  var path = '/iq/ps:pubsub/ps:options/x:x/x:field[@var="pubsub#subid"]/x:value/text()';
  this.areSame(subid, doc.getPathValue(path),
               'Option value for subid is wrong.');

};

YAHOO.util.Assert.isSubscribe = function (xml, jid, node, ourJID, options) {
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

  if (options) {
    this.areSame('submit',
                 doc.getPathValue('/iq/ps:pubsub/ps:options/x:x/@type'),
                 'options xform type is wrong.');

    this.areSame('http://jabber.org/protocol/pubsub#subscribe_options',
                 doc.getPathValue('/iq/ps:pubsub/ps:options/x:x/x:field[@var="FORM_TYPE"]/x:value/text()'),
                 'options xform FORM_TYPE is wrong.');

    for (var o in options) if (options.hasOwnProperty(o)) {
      var path = '/iq/ps:pubsub/ps:options/x:x/x:field[@var="pubsub#' + o + '"]/x:value/text()';

      this.areSame(options[o], doc.getPathValue(path),
                   'Option value for ' + o + ' is wrong.');
    }
  }
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

  this.areSame('get',
               doc.getPathValue('/iq/@type'),
               'get items iq is not type get.');
  this.areSame(jid,
               doc.getPathValue('/iq/@to'),
               'get items iq is sent to wrong jid.');
  this.areSame(node,
               doc.getPathValue('/iq/ps:pubsub/ps:items/@node'),
               'get items node is wrong');
};

YAHOO.util.Assert.throws = function(errorClass,cb) {
  try {
    cb();
  } catch(e) {
    this.isInstanceOf(errorClass,e,"Error raised was different from error expected");
    return;
  }
  this.fail("Function failed to raise an error");
};
