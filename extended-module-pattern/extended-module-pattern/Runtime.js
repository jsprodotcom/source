if(MyClass.supported){ MyClass = (function()
{

	//protected and privileged config dictionary
	var config = this.utils.extend(this.utils.privatise(this, 'config'), 
	{
		sample3	: '123'
	}),

	//protected utility functions
	utils = this.utils.extend(this.utils.privatise(this, 'utils'), 
	{
	});



	//=> test for the presence of sample config
	alert('Runtime.js:\n\n' + [config.sample1,config.sample2,config.sample3].join('\n'));



	//return the public members, which will now only contain the 
	//original public data, not the extended protected data
	//which was deleted from public view as it was imported
	return this;

}).apply(MyClass); }
