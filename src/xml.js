/**
 * Namespace for XML elements
 * @namespace
 * */
OX.XML = {};

/**
 * Namespace for XMPP XML elements
 * @namespace
 * */
OX.XMPP = {};

/**
 * A simple XML element class, call +extend+ to generate objects
 * that you can then call +toString+ on for an XML representation.
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
   * Get or set attributes on the receiver
   *
   * @param {String} name The attributes name
   * @param {String} [value] If value is supplied, the attribute will be set
   * @returns {String} the value of the attribute
   */
  attr: function(name,value) {
    this.attributes = this.attributes || {};
    if(value) {
      this.attributes[name] = value;
    }
    return this.attributes[name];
  },

  /**
   * Add a XML child element to the receiver
   *
   * @param {OX.XML.Element} child the XML element to add as a child
   * @returns {OX.XML.Element} this
   */
  addChild: function(child) {
    this.children = this.children || [];
    if(child) {
      this.children.push(child);
    }
    return this;
  },

  /**
   * @returns {String} this XML element as XML text
   */
  toString: function() {
    var ret = "";
    var attrs = [];

    if (this.xmlns) this.attr('xmlns',this.xmlns);

    if(this.attributes) for(var name in this.attributes) {
      var val = this.attributes[name];
      if(!val) continue;

      attrs.push(name + '="' + val + '"');
    }

    ret += "<" + this.name;
    ret += (attrs.length > 0) ? ' ' + attrs.join(' ') : '';
    ret += ">";

    if(this.children && this.children.length > 0) for(var el in this.children) {
      ret += this.children[el].toString();
    }

    if(this.text) ret += this.text;

    ret += "</" + this.name + ">";

    return ret;
  }
}, /** @lends OX.XML.Element */ {

  /**
   * +create+ is a static convenience function for creating a new OX.XML.Element
   * and setting attrs and elements in a single function
   *
   * @param {Object} [attrs] a hash of attribute names to attribute values
   * @param {Array} [elements] an array of OX.XML.Element to assign as children
   * @returns {OX.XML.Element}
   */
  create: function(attrs, elements) {
    var ret = this.extend();

    if (attrs) for(var k in attrs) {
      var v = attrs[k];
      if (!v) continue;
      ret.attr(k,v);
    }

    if (elements && elements.length) for(var i=0,len=elements.length; i < len; i++) {
      ret.addChild(elements[i]);
    }

    return ret;
  }
})

/**
 * @extends OX.XML.Element
 * @class
 */
OX.XMPP.Stanza = OX.XML.Element.extend(/** @lends OX.XMPP.Stanza# */{
  to: function(val) {
    return this.attr('to', val);
  },

  from: function(val) {
    return this.attr('from', val);
  }
});

/**
 * @extends OX.XMPP.Stanza
 * @class
 */
OX.XMPP.IQ = OX.XMPP.Stanza.extend(/** @lends OX.XMPP.IQ# */{
  name: 'iq',

  type: function(val) {
    return this.attr('type', val);
  }
});

/**
 * @extends OX.XMPP.Stanza
 * @class
 */
OX.XMPP.Message = OX.XMPP.Stanza.extend(/** @lends OX.XMPP.Message# */{
  name: 'message'
});

/**
 * @extends OX.XML.Element
 * @class
 */
OX.XMPP.Command = OX.XML.Element.extend(/** @lends OX.XMPP.Command# */{
  name: 'command',
  xmlns: 'http://jabber.org/protocol/commands',

  node: function(val) {
    return this.attr('node', val);
  },

  action: function(val) {
    return this.attr('action', val);
  }
});

/**
 * @extends OX.XML.Element
 * @class
 */
OX.XMPP.XDataForm = OX.XML.Element.extend(/** @lends OX.XMPP.XDataForm# */{
  name: 'x',
  xmlns: 'jabber:x:data',

  type: function(val) {
    return this.attr('type', val);
  },

  /**
   * A convenience method for adding fields and values to the XDataForm.  Calling
   * this method will add an XDataField and value to this XDataForm.
   *
   * @param {String} name the name of the field, as identified in the 'var' attribute
   * @param {String} value the text to insert into the 'value' element
   * @param {String} type XDataField type see XEP: 0004
   * @returns {OX.XMPP.XDataForm} this
   */
  addField: function(name,value,type) {
    var f,v;
    f = OX.XML.Element.extend({name: 'field'});
    f.attr('var',name);

    if(value) {
      v = OX.XML.Element.extend({name: 'value', text: value});
      f.addChild(v);
    }

    if(type) f.attr('type',type);

    return this.addChild(f);
  }
});
