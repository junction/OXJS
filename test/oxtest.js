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
//  parser: new DOMParser(),

  parser: function () {
    OX.log("In parser");
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
      doc = parser.loadXML(xml);
      OX.log("Using IE");
    }
    catch(e)
    {
      // Firefox and Safari
      doc = parser.parseFromString(xml, 'text/xml');
      OX.log("Using Firefox and Safari");
    }

    return OX.Base.extend({
      doc: doc,

      getPath: function (path) {
        var result;
        try {
          // Internet Explorer does not use XPathResult
          OX.log("In getPath(), path is: " + path);
          result = parser.selectSingleNode(path);
        }
        catch(e)
        {
          OX.log('Exception caught, using FF or Safari');
          result = this.doc.evaluate(path, this.doc, OXTest.DOMParser.nsResolver,
                                     XPathResult.ANY_TYPE, null).iterateNext();
        }
        return result;
      },

      getPathValue: function (path) {
        var rc = this.getPath(path);

        if (rc) {
          if (window.ActiveXObject) {
            return rc.nodeValue;
              /*
            if (rc.length > 1) {
              OX.log("isActiveX getPathValue() returning data");
              return rc[0].childNodes[0];
            } else if (rc.length == 1) {
              if (rc[0].childNodes.length > 0) {
                OX.log("isActiveX getPathValue() returning rc[0].childNodes[0].nodeValue: " + rc[0].childNodes[0].nodeValue);
                return rc[0].childNodes[0].nodeValue;
              } else {
                OX.log("isActiveX getPathValue() returning rc[0].nodeValue: " + rc[0].nodeValue);
                return rc[0].nodeValue;
              }
            } else {
              OX.log("isActiveX getPathValue() returning undefined");
              return undefined;
            }
               */
          } else {
            OX.log("rc is %o", rc);
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
  from:  null,
  to:    null,
  type:  null,
  doc:   null,

  extendWithXML: function (xml) {
    var doc = OXTest.DOMParser.parse(xml);

    var from = doc.getPathValue('//@from'),
        to   = doc.getPathValue('//@to'),
        type = doc.getPathValue('//@type');

    if (window.ActiveXObject) {
      return OXTest.Packet.extend({from: from, to: to, type: type, doc: doc});
    } else {
      return OXTest.Packet.extend({from: from, to: to, type: type, doc: doc.doc});
    }
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
