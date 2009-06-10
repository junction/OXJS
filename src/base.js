/**
 * Base object for OXJS. All other objects inherit from this one.
 * @class
 */
OX.Base = {
  /**
   * Creates a new object which extends the current object.  Any
   * arguments are mixed in to the new object as if {@link OX.Base.mixin}
   * was called on the new object with remaining args.
   *
   * @example
   * var obj = OX.Base.extend({param: value});
   *
   * @returns {OX.Base} the new object
   *
   * @see OX.Base.mixin
   */
  extend: function () {
    var F = function () {};
    F.prototype = this;

    var rc = new F();
    rc.mixin.apply(rc, arguments);

    if (rc.init && rc.init.constructor === Function) {
      rc.init.call(rc);
    }

    return rc;
  },

  /**
   * Iterates over all arguments, adding their own properties to the
   * receiver.
   *
   * @example
   * obj.mixin({param: value});
   *
   * @returns {OX.Base} the receiver
   *
   * @see OX.Base.extend
   */
  mixin: function () {
    for (var i = 0, len = arguments.length; i < len; i++) {
      for (var k in arguments[i]) if (arguments[i].hasOwnProperty(k)) {
        this[k] = arguments[i][k];
      }
    }

    return this;
  }
};
