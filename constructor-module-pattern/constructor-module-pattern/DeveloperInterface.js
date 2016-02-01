if(Widget.supported){ Widget = (function()
{

	//protected instances dictionary
	var instances = this.utils.privatise(this, 'instances'),

	//protected and privileged config dictionary
	config = this.utils.extend(this.utils.privatise(this, 'config'), 
	{
	}),

	//protected utility functions
	utils = this.utils.extend(this.utils.privatise(this, 'utils'), 
	{
	});



	//public developer interface constructor
	this.DeveloperInterface = function(key)
	{
		this.key = key;
		instances[this.key] =
		{
			question : document.getElementById('Question-' + this.key)
		};
		
		instances[this.key].question.instance = this;
	};
	
	//developer interface prototypes
	this.DeveloperInterface.prototype = 
	{
		load : function(text)
		{
			var intro = document.createElement('p');
			intro.appendChild(document.createTextNode(text));
			instances[this.key].question.appendChild(intro);
			
			instances[this.key].question.className += ' ready';
		},
		save : function()
		{
		}
	};



	//return the public members, which will now only contain the 
	//original public data, not the extended protected data
	//which was deleted from public view as it was imported
	return this;

}).apply(Widget); }
