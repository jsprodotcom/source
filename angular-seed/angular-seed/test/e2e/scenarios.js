'use strict';

describe('my app', function() {
    beforeEach(function() {
		browser().navigateTo('../../app/notes.html');
    });

	var oldCount=-1;
	it("entering note and performing click", function () {

			element('ul').query(function($el, done) {
				oldCount=$el.children().length;
				done();
			});

			
			input('note').enter('test data');
			
			
			element('button').query(function($el, done) {
				$el.click();
				done();
			});

			
				
		});
	 it('should add one more element now',function(){
			expect(repeater('ul li').count()).toBe(oldCount+1);
	 });	
		
});
