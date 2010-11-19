OXTest.Base = new YAHOO.tool.TestCase({
  name: 'OX.Base Tests',

  testExtend: function () {
    var Assert = YAHOO.util.Assert;

    var tmp = OX.Base.extend();
    Assert.isObject(tmp);
    Assert.isFunction(tmp.extend);
    Assert.areNotSame(tmp, OX.Base);

    var tmp2 = tmp.extend({foo: 'foo'});
    Assert.areSame('foo', tmp2.foo);
    Assert.isUndefined(tmp.foo);
  },

  testMixin: function () {
    var Assert = YAHOO.util.Assert;

    var tmp = OX.Base.extend();
    tmp.mixin({foo: 'foo'});
    Assert.areSame('foo', tmp.foo);
  },

  testMixinInferiorFunctionality: function () {
    var Assert = YAHOO.util.Assert;

    var foo = OX.Base.extend({
      bar: function () {
        Assert.isTrue(true, "The superior function was called.");
      }
    });

    var fooBar = foo.extend({
      bar: function () {
        Assert.isTrue(false, "The inferior function was called.");
      }.inferior()
    });

    foo.bar();
    fooBar.bar();
  },

  testMixinWithAroundAugmentor: function () {
    var Assert = YAHOO.util.Assert;

    var foo = OX.Base.extend({
      bar: function ($super) {
        Assert.isTrue(true, "The lowest level function was called.");
        $super();
        return 'foo';
      }.around()
    });

    var fooBar = foo.extend({
      bar: function ($super) {
        Assert.isTrue(true, "The middle level function was called.");
        return $super() + 'bar';
      }.around()
    });

    var fooBarBaz = fooBar.extend({
      bar: function ($super) {
        Assert.isTrue(true, "The top level function was called.");
        return $super() + 'baz';
      }.around()
    });

    Assert.areEqual('foo', foo.bar(), "'foo' was expected");
    Assert.areEqual('foobar', fooBar.bar(), "'foobar' was expected");
    Assert.areEqual('foobarbaz', fooBarBaz.bar(), "'foobarbaz' was expected");
  },

  testMixinUndefinedOrNullArguments: function() {
    var Assert = YAHOO.util.Assert;
    var foo = OX.Base.mixin.call({
      name: "foo"
    }, undefined);

    Assert.areEqual("foo", foo.name, "foo should have a name 'foo'");

    var bar = OX.Base.mixin.call({
      name: "bar"
    }, null);

    Assert.areEqual("bar", bar.name, "bar should have a name 'bar'");
  },

  testMixinOverridesValues: function() {
    var Assert = YAHOO.util.Assert;
    var bart = OX.Base.mixin.call({
      name: "Bart Simpson"
    }, {name: "Bartolomeu"});

    Assert.areEqual("Bartolomeu", bart.name, "bart should be 'Bartolomeu'");
  }

});

YAHOO.tool.TestRunner.add(OXTest.Base);
