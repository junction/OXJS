/* Namespace for OXJS tests. */
var OXTest = {};

OXTest.ConnectionMock = {
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
};