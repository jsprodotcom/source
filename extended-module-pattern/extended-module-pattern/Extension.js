if(MyClass.supported){ MyClass = (function()
{

	//protected and privileged config dictionary
	var config = this.utils.extend(this.config,
	{
		sample2	: 'abc'
	}),

	//protected utility functions
	utils = this.utils.extend(this.utils, 
	{
	});
	
	
	
	//=> test for the presence of sample config
	alert('Extension.js:\n\n' + [config.sample1,config.sample2].join('\n'));



	//return the public and protected members
	return this;

}).apply(MyClass); }
