'use strict';

describe('TodoController Test', function() {
    beforeEach(module('todoApp'));
	
	var mockService = {
		notes:['test1','test2'],
		get: function (){
			return this.notes;
		},
		put:function(content){
			this.notes.push(content);
		}
	}
	
    it('should return notes array with 2 elements initially',
          inject(function($rootScope, $controller) {
              var scope = $rootScope.$new();
              var ctrl = $controller("TodoController", {$scope: scope,notesFactory:mockService });
              expect(scope.notes.length).toBe(2);
			  scope.note="test3";
			  scope.createNote();
			  expect(scope.notes.length).toBe(3);
    }));
});