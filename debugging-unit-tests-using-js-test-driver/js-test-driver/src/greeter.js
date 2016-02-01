myapp = {};

myapp.Greeter = function() { };

myapp.Greeter.prototype.greet = function(name) {
    return "Hello " + name + "!";
};
