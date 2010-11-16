/**
 * @class
 * Base object for OXJS. All other objects inherit from this one.
 * This provides object inheritance much like Douglas Crockford's
 * <a href="http://javascript.crockford.com/prototypal.html">Prototypal
 * Inheritance in JavaScript</a> with a few modifications of our own.
 *
 * This framework uses Object templates rather than classes to provide
 * inheritance.
 */
OX.Base = {

  /**
   * Creates a new object which extends the current object.  Any
   * arguments are mixed in to the new object as if {@link OX.Base.mixin}
   * was called on the new object with remaining args.
   *
   * @example
   *   var obj = OX.Base.extend({
   *     hello: "world"
   *   });
   *   obj.hello;
   *   // -> "world"
   * 
   *   OX.Base.hello;
   *   // -> undefined
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
   *   obj.mixin({
   *     hello: "world"
   *   });
   *   obj.hello;
   *   // -> "world"
   *
   * @returns {OX.Base} the receiver
   *
   * @see OX.Base.extend
   */
  mixin: function () {
    var i, len, key, base, mixin, obj,
        /** @ignore */
        empty = function () {}, transform;

    for (i = 0, len = arguments.length; i < len; i++) {
      obj = arguments[i];
      for (key in obj) {
        if (obj.hasOwnProperty(key)) {
          mixin = obj[key];

          if (this[key] && mixin && mixin._oxInferior) {
            continue;
          }

          if (mixin && mixin instanceof Function && mixin._ox) {
            for (transform in mixin._ox) {
              if (mixin._ox.hasOwnProperty(transform)) {
                mixin = mixin._ox[transform](this, mixin, key);
              }
            }
          }

          this[key] = mixin;
        }
      }

      // Prevents IE from clobbering toString
      if (obj && obj.toString !== Object.prototype.toString) {
        this.toString = obj.toString;
      }
    }

    return this;
  }
};
