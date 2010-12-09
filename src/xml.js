/**
 * Namespace for XML elements
 * @namespace
 */
OX.XML = {};

/**
 * A simple XML element class.
 *
 * @example
 * var newElement = OX.XML.Element.extend({name: 'foo'})
 * newElement.attr('bar', 'bam');
 * newElement.addChild(OX.XML.Element.extend({name: 'child'});
 *
 * @extends OX.Base
 * @class
 */
OX.XML.Element = OX.Base.extend(/** @lends OX.XML.Element# */{
  name: null,
  attributes: null,
  xmlns: null,
  children: null,
  text: null,

  /**
   * Get or set attributes on the receiver.
   *
   * @param {String} name The attributes name.
   * @param {String} [value] If value is supplied, the attribute will be set.
   * @returns {String} the value of the attribute.
   */
  attr: function (name, value) {
    this.attributes = this.attributes || {};
    if (value) {
      this.attributes[name] = value;
    }
    return this.attributes[name];
  },

  /**
   * Add a XML child element to the receiver.
   *
   * @param {OX.XML.Element} child The XML element to add as a child.
   * @returns {OX.XML.Element} The receiver.
   */
  addChild: function (child) {
    this.children = this.children || [];
    if (child) {
      this.children.push(child);
    }
    return this;
  },

  /**
   * @function
   * Escape XML characters to prevent parser errors.
   *
   * @param {String} string The string to escape.
   * @returns {String} The escaped string.
   */
  escapeXML: (function () {
    var character = {
      '"': '&quot;',
      "'": '&apos;',
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;'
    }, re = /[<>&"']/g;
    return function (str) {
      return str.replace(re, function (c) {
        return character[c];
      });
    };
  }()),

  /**
   * Return an XML string representation of this element.
   *
   * @returns {String} This XML element as XML text.
   */
  convertToString: function () {
    var ret = "";
    var attrs = [];

    if (this.xmlns) {
      this.attr('xmlns', this.xmlns);
    }

    if (this.attributes) {
      for (var name in this.attributes) {
        var val = this.attributes[name];
        if (!val) {
          continue;
        }

        attrs.push(name + '="' + this.escapeXML(val.toString()) + '"');
      }
    }

    ret += "<" + this.name;
    ret += (attrs.length > 0) ? ' ' + attrs.join(' ') : '';
    ret += ">";

    var children = this.children || [];
    for (var i = 0, len = children.length; i < len; i++) {
      ret += this.children[i].convertToString();
    }

    if (this.text) {
      ret += this.escapeXML(this.text.toString());
    }

    ret += "</" + this.name + ">";

    return ret;
  }
}, /** @lends OX.XML.Element */ {

  /**
   * Convenience function for creating a new OX.XML.Element and
   * setting attrs and elements in a single function
   *
   * @param {Object} [attrs] A hash of attribute names to attribute values.
   * @param {OX.XML.Element[]} [elements] An array of OX.XML.Element to assign as children.
   * @returns {OX.XML.Element}
   */
  create: function (attrs, elements) {
    var ret = this.extend();

    if (attrs) {
      for (var k in attrs) {
        if (attrs.hasOwnProperty(k)) {
          var v = attrs[k];
          if (!v) {
            continue;
          }
          ret.attr(k, v);
        }
      }
    }

    elements = (elements && elements.addChild) ? [elements] : elements;
    if (elements && elements.length) {
      for (var i = 0, len = elements.length; i < len; i++) {
        ret.addChild(elements[i]);
      }
    }

    return ret;
  }
});

/**
 * Namespace for XMPP XML elements.
 * @namespace
 */
OX.XMPP = {};

/**
 * Generic XMPP stanza.
 *
 * @extends OX.XML.Element
 * @class
 */
OX.XMPP.Stanza = OX.XML.Element.extend(/** @lends OX.XMPP.Stanza# */{
  to: function (val) {
    return this.attr('to', val);
  },

  from: function (val) {
    return this.attr('from', val);
  }
});

/**
 * XMPP IQ stanza.
 *
 * @extends OX.XMPP.Stanza
 * @class
 */
OX.XMPP.IQ = OX.XMPP.Stanza.extend(/** @lends OX.XMPP.IQ# */{
  name: 'iq',

  type: function (val) {
    return this.attr('type', val);
  }
});

/**
 * XMPP PubSub Element
 *
 * @extends OX.XML.Element
 * @class
 */
OX.XMPP.PubSub = OX.XML.Element.extend(/** @lends OX.XMPP.PubSub# */{
  name: 'pubsub',
  xmlns: 'http://jabber.org/protocol/pubsub'
});

/**
 * XMPP Message stanza.
 *
 * @extends OX.XMPP.Stanza
 * @class
 */
OX.XMPP.Message = OX.XMPP.Stanza.extend(/** @lends OX.XMPP.Message# */{
  name: 'message'
});

/**
 * XMPP AdHoc Command element.
 *
 * @extends OX.XML.Element
 * @class
 */
OX.XMPP.Command = OX.XML.Element.extend(/** @lends OX.XMPP.Command# */{
  name: 'command',
  xmlns: 'http://jabber.org/protocol/commands',

  node: function (val) {
    return this.attr('node', val);
  },

  action: function (val) {
    return this.attr('action', val);
  }
});

/**
 * XMPP XDataForm element.
 *
 * @extends OX.XML.Element
 * @class
 */
OX.XMPP.XDataForm = OX.XML.Element.extend(/** @lends OX.XMPP.XDataForm# */{
  name: 'x',
  xmlns: 'jabber:x:data',

  type: function (val) {
    return this.attr('type', val);
  },

  /**
   * A convenience method for adding fields and values to the
   * XDataForm. Calling this method will add an XDataField and value to
   * this XDataForm.
   *
   * @param {String} name The name of the field, as identified in the 'var' attribute.
   * @param {String} value The text to insert into the 'value' element.
   * @param {String} type XDataField type see XEP: 0004.
   * @returns {OX.XMPP.XDataForm} The receiver.
   */
  addField: function (name, value, type) {
    var f, v;
    f = OX.XML.Element.extend({name: 'field'});
    f.attr('var', name);

    if (value) {
      v = OX.XML.Element.extend({name: 'value', text: value});
      f.addChild(v);
    }

    if (type) {
      f.attr('type', type);
    }

    return this.addChild(f);
  }
});
