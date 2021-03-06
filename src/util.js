/**
 * Utitity functions for OXJS.
 */
OX.Base.mixin.call(Function.prototype, /** @scope Function.prototype */{

  /**
   * Marks the function as inferior.
   * If a key exists on the mixin, and the new mixin
   * is marked as inferior, it will ignore the new function,
   * relying on the old function for its implementation.
   * @example
   *   var foo = OX.Base.extend({
   *     bar: function () {
   *       return "superior";
   *     },
   *   }, {
   *     bar: function () {
   *       return "inferior";
   *     }.inferior()
   *   });
   *
   *   foo.bar();
   *   // -> "superior"
   * @returns {Function} The reciever.
   */
  inferior: function () {
    this._oxInferior = true;
    return this;
  },

  /**
   * <p>Provides access to the overridden base function.
   * If there is no base function to override, the first
   * argument to the function will be an empty function
   * that returns nothing.</p>
   *
   * <p>The first argument passed in is the base function,
   * bound to the correct scope (so you don't need to
   * call apply/call).</p>
   *
   * @example
   *   var foo = OX.Base.extend({
   *     bar: function (junk) {
   *       return 'bar' + junk;
   *     }
   *   });
   *   var fooBar = foo.extend({
   *     bar: function ($super, junk) {
   *       return 'foo' + $super(junk);
   *     }.around()
   *   });
   *
   *   foo.bar('bell');
   *   // -> 'barbell'
   *   fooBar.bar('n');
   *   // -> 'foobarn'
   * @returns {Function} The reciever.
   */
  around: function () {
    this._ox = this._ox || {};

    var empty = function () {},
    slice = Array.prototype.slice,
    /** @ignore */
    bind = function (lambda, that) {
      return function () {
        return lambda.apply(that, arguments);
      };
    };

    /** @ignore */
    this._ox.around = function (template, value, key) {
      var base = template[key] || empty;
      if (!(base instanceof Function)) {
        return value;
      }

      return function () {
        return value.apply(this, [bind(base, this)].concat(slice.apply(arguments)));
      };
    };

    return this;
  }
});
