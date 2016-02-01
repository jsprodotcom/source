'use strict';

describe('notesFactory tests', function (){
  var factory;
  
  //excuted before each "it" is run.
  beforeEach(function (){
    
    //load the module.
    module('todoApp');
    
    //inject your factory for testing.
    inject(function(notesFactory) {
      factory = notesFactory;
    });
	
	  var store = {todo1:'test1',todo2:'test2',todo3:'test3'};

	  spyOn(localStorage, 'getItem').andCallFake(function (key) {
		  return store[key];
	  });
	  spyOn(localStorage, 'setItem').andCallFake(function (key, value) {
		  return store[key] = value + '';
	  });
	  spyOn(localStorage, 'clear').andCallFake(function () {
		  store = {};
	  });
    spyOn(Object, 'keys').andCallFake(function (key) {
  		var keys=[];
  		for(var key in store)
  			keys.push(key);
  		return keys;
	  });

  });
     
  //check to see if it has the expected function
  it('should have a get function', function () { 
    expect(angular.isFunction(factory.get)).toBe(true);
    expect(angular.isFunction(factory.put)).toBe(true);
  });
  
  //check to see if it returns 3 notes initially
  it('should return 3 todo notes initially', function (){
    var result = factory.get();
    expect(result.length).toBe(3);
  });
  
  //check if it successfully adds a new item
  it('should return 4 todo notes after adding one more', function (){
    factory.put('Angular is awesome');
	  var result = factory.get();
    expect(result.length).toBe(4);
  });

});
