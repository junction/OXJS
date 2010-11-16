/**
 * @namespace
 * Namespace for XML elements
 */
OX.XML = {};

/**
 * @class
 * A simple XML element class.
 *
 * @example
 *   var newElement = OX.XML.Element.extend({name: 'foo'});
 *   newElement.attr('bar', 'bam');
 *   newElement.addChild(OX.XML.Element.extend({name: 'child'}));
 *   newElement.toString();
 *   // -> '<foo bar="bam"><child></child></foo>'
 *
 * @extends OX.Base
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
   * Return an XML string representation of this element.
   *
   * @returns {String} This XML element as XML text.
   */
  toString: function () {
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

        attrs.push(name + '="' + val + '"');
      }
    }

    ret += "<" + this.name;
    ret += (attrs.length > 0) ? ' ' + attrs.join(' ') : '';
    ret += ">";

    var children = this.children || [];
    for (var i = 0, len = children.length; i < len; i++) {
      ret += this.children[i].toString();
    }

    if (this.text) {
      ret += this.text;
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
 * @namespace
 * Namespace for XMPP XML elements.
 */
OX.XML.XMPP = {};

/**
 * @class
 * Generic XMPP stanza.
 *
 * @extends OX.XML.Element
 */
OX.XML.XMPP.Stanza = OX.XML.Element.extend(/** @lends OX.XML.XMPP.Stanza# */{

  /**
   * The 'to' attribute of the stanza.
   *
   * @param {String} [value] The value to set the 'to' attribute.
   * @returns {String} The value of the 'to' attribute.
   */
  to: function (val) {
    return this.attr('to', val);
  },

  /**
   * The 'from' attribute of the stanza.
   *
   * @param {String} [value] The value to set the 'from' attribute.
   * @returns {String} The value of the 'from' attribute.
   */
  from: function (val) {
    return this.attr('from', val);
  }
});

/**
 * @class
 * XMPP IQ (Info Query) stanza.
 *
 * @extends OX.XML.XMPP.Stanza
 */
OX.XML.XMPP.IQ = OX.XML.XMPP.Stanza.extend(/** @lends OX.XML.XMPP.IQ# */{

  /** The IQ tag name */
  name: 'iq',

  /**
   * The 'type' attribute of the stanza.
   *
   * @param {String} [value] The value to set the 'type' attribute.
   * @returns {String} The value of the 'type' attribute.
   */
  type: function (val) {
    return this.attr('type', val);
  }
});

/**
 * @class
 * XMPP PubSub Element
 *
 * @extends OX.XML.Element
 */
OX.XML.XMPP.PubSub = OX.XML.Element.extend(/** @lends OX.XML.XMPP.PubSub# */{
  /** The PubSub tag name */
  name: 'pubsub',
  /** The PubSub namespace */
  xmlns: 'http://jabber.org/protocol/pubsub'
});

/**
 * @class
 * XMPP Message stanza.
 *
 * @extends OX.XML.XMPP.Stanza
 */
OX.XML.XMPP.Message = OX.XML.XMPP.Stanza.extend(/** @lends OX.XML.XMPP.Message# */{
  /** The Message tag name */
  name: 'message'
});

/**
 * @class
 * XMPP AdHoc Command element.
 *
 * @extends OX.XML.Element
 * @see <a href="http://xmpp.org/extensions/xep-0050.html">XEP-0050 Ad-Hoc Commands</a>
 */
OX.XML.XMPP.Command = OX.XML.Element.extend(/** @lends OX.XML.XMPP.Command# */{
  /** The Command tag name */
  name: 'command',
  /** The Command namespace */
  xmlns: 'http://jabber.org/protocol/commands',

  /**
   * The 'node' attribute of the stanza.
   *
   * @param {String} [value] The value to set the 'node' attribute.
   * @returns {String} The value of the 'node' attribute.
   */
  node: function (val) {
    return this.attr('node', val);
  },

  /**
   * The 'action' attribute of the stanza.
   *
   * @param {String} [value] The value to set the 'action' attribute.
   * @returns {String} The value of the 'action' attribute.
   */
  action: function (val) {
    return this.attr('action', val);
  }
});

/**
 * @class
 * XMPP XDataForm element.
 *
 * @extends OX.XML.Element
 * @see <a href="http://xmpp.org/extensions/xep-0004.html">XEP-0004 Data Forms</a>
 */
OX.XML.XMPP.XDataForm = OX.XML.Element.extend(/** @lends OX.XML.XMPP.XDataForm# */{
  /** The Data Forms tag name */
  name: 'x',
  /** The Data Forms namespace */
  xmlns: 'jabber:x:data',

  /**
   * The 'type' attribute of the stanza.
   *
   * @param {String} [value] The value to set the 'type' attribute.
   * @returns {String} The value of the 'type' attribute.
   */
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
   * @returns {OX.XML.XMPP.XDataForm} The receiver.
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
