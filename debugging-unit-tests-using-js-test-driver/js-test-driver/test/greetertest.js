TestCase("GreeterTest", {
    setUp:function () {
    },

    "test greet": function() {
        var greeter = new myapp.Greeter();
        assertEquals("Hello World!", greeter.greet("World"));
    },
    "test greet null": function() {
        var greeter = new myapp.Greeter();
        assertNull(greeter.greet(null));
    }
});
