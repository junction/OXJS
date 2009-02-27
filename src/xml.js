/** @namespace */
OX.XMPP = {};
OX.XML = {};

OX.XML.Element = OX.Base.extend({
  name: null,
  attributes: null,
  ns: null,
  children: null,
  text: null,

  attr: function(name,value) {
    this.attributes = this.attributes || {};
    if(value) {
      this.attributes[name] = value;
    }
    return this.attributes[name];
  },

  addChild: function(child) {
    this.children = this.children || [];
    if(child) {
      this.children.push(child);
    }
    return this;
  },

  toString: function() {
    var ret = "";
    var attrs = [];

    if (this.ns) this.attr('ns',this.ns);

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
});

OX.XMPP.Stanza = OX.XML.Element.extend({
  to: function(val) {
    return this.attr('to', val);
  },

  from: function(val) {
    return this.attr('from', val);
  }
});

OX.XMPP.IQ = OX.XMPP.Stanza.extend({
  name: 'iq',

  type: function(val) {
    return this.attr('type', val);
  }
});

OX.XMPP.Message = OX.XMPP.Stanza.extend({
  name: 'message'
});

OX.XMPP.Command = OX.XML.Element.extend({
  name: 'command',
  ns: 'http://jabber.org/protocol/commands',

  node: function(val) {
    return this.attr('node', val);
  },

  action: function(val) {
    return this.attr('action', val);
  }
});

OX.XMPP.XDataForm = OX.XML.Element.extend({
  name: 'x',
  ns: 'jabber:x:data',

  type: function(val) {
    return this.attr('type', val);
  },

  addField: function(name,value,type) {
    var f;
    if(value) {
      f = OX.XML.Element.extend({name: 'field'});
      f.attr('var', name);
      if(type) f.attr('type',type);

      f.addChild(OX.XML.Element.extend({name: 'value', text: value}));
    }
    return this;
  }
});
