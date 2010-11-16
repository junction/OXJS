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
   * Provides access to the overridden base function.
   * If there is no base function to override, the first
   * argument to the function will be an empty function
   * that returns nothing.
   *
   * The first argument passed in is the base function,
   * bound to the correct scope (so you don't need to
   * call apply/call).
   *
   * @example
   *   var foo = OX.Base.extend({
   *     bar: function (junk) {
   *       return 'bar' + junk;
   *     }
   *   });
   *   var fooBar = OX.Base.extend({
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
        slice = Array.prototype.slice;

    /** @ignore */
    this._ox.around = function (template, value, key) {
      var base = template[key] || empty;

      if (base instanceof Function) {
        /** @ignore */
        base = function () {
          value.apply(this, [base.bind(this)].concat(slice.apply(arguments)));
        };
      }
      return base;
    };
    return this;
  }
});
