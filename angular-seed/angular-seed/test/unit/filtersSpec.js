describe('filter tests', function() {
	beforeEach(module('todoApp'));
	it('should truncate the input to 10 characters',
		inject(function(truncateFilter) {
	    expect(truncateFilter('abcdefghijk',10).length).toBe(10);
	}));
});